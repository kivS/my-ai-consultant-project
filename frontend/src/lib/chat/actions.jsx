import "server-only";

import {
	createAI,
	createStreamableUI,
	createStreamableValue,
	getAIState,
	getMutableAIState,
	streamUI,
} from "ai/rsc";
import { z } from "zod";
import {
	AssistantMarkdownMessage,
	AssistantMessage,
	SpinnerMessage,
	SystemMessage,
	UserMessage,
} from "@/components/chat/message";
import Whiteboard from "@/components/whiteboard/whiteboard";
import DatabaseWhiteboard from "@/components/database-whiteboard";
import { openai, createOpenAI as createGroq } from "@ai-sdk/openai";
import { nanoid } from "nanoid";
import ExportToPopUp from "@/components/whiteboard/export-to";
import {
	generateId,
	generateObject,
	generateText,
	streamObject,
	streamText,
} from "ai";
import { wait } from "../utils";
import { ExportedDbWhiteboardDialog } from "@/components/whiteboard/exported-to-rails-dialog";
import { ExportedToSqliteDialog } from "@/components/whiteboard/exported-to-sqlite-dialog";
import {
	createChat,
	getChat,
	getCurrentDatabaseWhiteboard,
	isUserRateLimited,
	saveChatMessages,
	updateChatDatabaseWhiteboard,
} from "@/app/actions";

const groq = createGroq({
	baseURL: "https://api.groq.com/openai/v1",
	apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `\
Your name is Nabubit and you are a friendly assitant that helps the user with their database architectures, from modeling databases from ideias, to understanding current database modeling/architecture and modifying it.

The UTC date today is ${new Date().toUTCString()}.

- If the user user wants to manipulate the database/whiteboard--by adding, modifying, removing and etc from it--you should call the \`update_database_whiteboard\` function
- If the user wants to display the current state of the database/whiteboard, you should call the \`show_database_whiteboard\` function.

Messages between square brackets(eg: [ Database whiteboard updated]) are system messages and are there only to show the user that a action was taken, don't use it for anything else.
`;

const MODEL_FOR_USER_SUBMITTED_MESSAGES = openai("gpt-4o-mini", {
	structuredOutputs: true,
});
const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE = openai("gpt-4o-mini", {
	structuredOutputs: true,
});
const MODEL_FOR_SCHEMA_IMPORT = openai("gpt-4o-mini", {
	structuredOutputs: false,
});

export const database_whiteboard_output_schema = z.object({
	initialNodes: z
		.array(
			z.object({
				id: z
					.string()
					.describe("ID for the node, representing the table, eg: table_name"),
				type: z
					.literal("dbTableNode")
					.describe("Type of the node used. node types: dbTableNode "),

				position: z.object({
					x: z.number().describe("the position of the node in the x axis"),
					y: z.number().describe("the position of the node in the y axis"),
				}),
				data: z.object({
					name: z.string().describe("the name of the table"),
					columns: z.array(
						z.object({
							id: z
								.string()
								.describe("Numerical id that identifies the column. Unique"),
							name: z.string().describe("Name of the column"),
							is_primary_key: z
								.boolean()
								.describe(
									"Whether the field the primary key for the table or not. A relational database table should have only one primary key",
								),
							type: z.string().describe("Type of the field column"),
							is_foreign_key: z
								.boolean()
								.describe("Either the field is a foreign key or not"),
							foreign_key_table: z
								.string()
								.optional()
								.describe(
									"The table name of the foreign table that this field refers to. If the column item is a foreign_key.",
								),
							foreign_key_field: z
								.string()
								.optional()
								.describe(
									"A field in the foreign table that this field refers to. If the column item is a foreign key.",
								),
						}),
					),
				}),
			}),
		)
		.describe(
			"an array of nodes definition for reactflow that'll represent the current state of the database",
		),
});

async function submitUserMessage(userInput) {
	"use server";

	const timeStart = Date.now();

	const aiState = getMutableAIState();

	let chat = null;

	const textStream = createStreamableValue("");
	const spinnerStream = createStreamableUI(<SpinnerMessage />);
	const messageStream = createStreamableUI(null);
	const uiStream = createStreamableUI();

	const userIsRateLimited = await isUserRateLimited();
	if (userIsRateLimited.is_rate_limited) {
		const msg = "Too many messages.. try again later!";
		spinnerStream.update(null);
		messageStream.done(<AssistantMarkdownMessage content={msg} />);
		uiStream.done();
		aiState.done();

		return {
			id: generateId(),
			display: messageStream.value,
			spinner: spinnerStream.value,
			attachments: uiStream.value,
		};
	}

	if (!aiState.get().chatId) {
		console.debug("user submitted a message: ", aiState.get());

		console.debug("No chatId, must be a new chat. Creating a new chat...");

		chat = await createChat({
			title: userInput.substring(0, 100),
		});

		aiState.update({
			...aiState.get(),
			chatId: chat.id,
		});
	}

	// Update the AI state with the new user message.
	aiState.update({
		...aiState.get(),
		messages: [
			...aiState.get().messages,
			{
				id: generateId(),
				timestamp: new Date().toISOString(),
				role: "user",
				content: userInput,
			},
		],
	});

	chat = await getChat(aiState.get().chatId);

	(async () => {
		try {
			const result = await streamText({
				model: MODEL_FOR_USER_SUBMITTED_MESSAGES,
				temperature: 0,
				system: SYSTEM_PROMPT,
				tools: {
					update_database_whiteboard: {
						description:
							"Manipulate the database whiteboard, aka, the representation of the database architecture",
						parameters: database_whiteboard_output_schema,
					},

					show_database_whiteboard: {
						description:
							"Show the current state of the database whiteboard, aka, the representation of the database architecture",
						parameters: z.object({}),
					},
				},
				messages: [
					...aiState
						.get()
						.messages.filter(
							(message) => !(message.role === "assistant" && message.display),
						),
					{
						role: "system",
						content: `current database_whiteboard: ${JSON.stringify(chat.database_whiteboard.whiteboard)}`,
					},
				],
				onFinish: (event) => {
					// console.debug({ streamTextResult_onFinish: JSON.stringify(event, null, 2) });
				},
			});

			let textContent = "";

			for await (const delta of result.fullStream) {
				const { type, finishReason } = delta;

				if (type === "text-delta") {
					const { textDelta } = delta;

					spinnerStream.update(null);

					if (!textContent) {
						console.debug(
							`[submitUserMessage:text-stream-start] - ${Date.now() - timeStart} ms`,
						);
					}

					textContent += textDelta;
					messageStream.update(
						<AssistantMarkdownMessage content={textContent} />,
					);
				} else if (type === "finish" && finishReason === "stop") {
					// console.log("finished text!");
					// console.log({ finishReason });
					// console.log({ textContent });
					aiState.update({
						...aiState.get(),
						messages: [
							...aiState.get().messages,
							{
								id: generateId(),
								timestamp: new Date().toISOString(),
								role: "assistant",
								content: textContent,
							},
						],
					});
					console.debug(
						`[submitUserMessage:text-stream-finish] - ${Date.now() - timeStart} ms`,
					);
				} else if (type === "tool-call") {
					const { toolName, args } = delta;

					if (toolName === "update_database_whiteboard") {
						const { initialNodes } = args;

						spinnerStream.update(null);

						const resultId = generateId();

						aiState.update({
							...aiState.get(),
							messages: [
								...aiState.get().messages,
								{
									id: resultId,
									role: "assistant",
									timestamp: new Date().toISOString(),
									content: "here's the updated database whiteboard",
									display: {
										name: "update_database_whiteboard",
										props: {
											messageId: resultId,
											initialNodes,
										},
									},
								},
							],
						});

						uiStream.update(
							<AssistantMessage>
								<DatabaseWhiteboard
									initialNodes={initialNodes}
									initialEdges={[]}
								/>
								<ExportToPopUp toolResultId={resultId} />
							</AssistantMessage>,
						);

						const updateWhiteboardResult = await updateChatDatabaseWhiteboard(
							aiState.get().chatId,
							initialNodes,
						);

						console.debug(
							`[submitUserMessage:update_database_whiteboard] - ${Date.now() - timeStart} ms`,
						);
					}

					if (toolName === "show_database_whiteboard") {
						// get the current database whiteboard from db
						// render it for the user to check

						const whiteboard = await getCurrentDatabaseWhiteboard(
							aiState.get().chatId,
						);

						spinnerStream.update(null);

						const msgId = generateId();

						aiState.update({
							...aiState.get(),
							messages: [
								...aiState.get().messages,
								{
									id: msgId,
									role: "assistant",
									timestamp: new Date().toISOString(),
									content: "here's the current database whiteboard",
									display: {
										name: "show_database_whiteboard",
										props: {
											messageId: msgId,
											initialNodes: whiteboard.initialNodes,
										},
									},
								},
							],
						});

						uiStream.update(
							<AssistantMessage>
								<DatabaseWhiteboard
									initialNodes={whiteboard.initialNodes}
									initialEdges={[]}
								/>
								<ExportToPopUp toolResultId={msgId} />
							</AssistantMessage>,
						);

						console.debug(
							`[submitUserMessage:show_database_whiteboard] - ${Date.now() - timeStart} ms`,
						);
					}
				}
			}

			uiStream.done();
			textStream.done();
			messageStream.done();
			spinnerStream.done();
			aiState.done();
			console.debug(`[submitUserMessage] - ${Date.now() - timeStart} ms`);
		} catch (e) {
			console.error(e);
			aiState.done();
		}
	})();

	return {
		id: generateId(),
		display: messageStream.value,
		spinner: spinnerStream.value,
		attachments: uiStream.value,
	};
}

export async function importSchema(fromChatId, type, schema) {
	"use server";

	try {
		const timeStart = Date.now();
		const aiState = getMutableAIState();

		let system_prompt = "";
		let chatId = null;

		if (!fromChatId) {
			console.debug("No chatId, must be a new chat. Creating a new chat...");

			const chat = await createChat({
				title: `Chat from a ${type} schema`,
			});

			aiState.update({
				...aiState.get(),
				chatId: chat.id,
			});

			chatId = chat.id;
		} else {
			chatId = fromChatId;
		}

		console.log(`Processing ${type} schema for chat:${chatId}`);

		switch (type) {
			case "rails": {
				system_prompt = `\
You are a bot that  given a Ruby on Rails schema.rb, you generate the database whiteboard schema representation(current state of the database). 
the schema is in json.
`;
				break;
			}

			case "postgres": {
				system_prompt = `\
You are a bot that  given a Postgres schema, you generate the database whiteboard schema representation(current state of the database).
the schema is in json.
`;
				break;
			}

			case "mssql": {
				system_prompt = `\
You are a bot that  given a mssql(Microsoft SQL Server) schema, you generate the database whiteboard schema representation(current state of the database).
the schema is in json.
`;
				break;
			}

			case "mysql": {
				system_prompt = `\
You are a bot that  given a MySQL schema, you generate the database whiteboard schema representation(current state of the database).
the schema is in json.
`;
				break;
			}

			default:
				throw new Error(`[${type}] is not allowed`);
		}

		const stream = createStreamableValue();
		const isStreaming = createStreamableValue(true);

		const messageId = generateId();
		const systemMessageText = `[ Imported ${type?.toUpperCase()} schema ]`;

		(async () => {
			const { partialObjectStream } = await streamObject({
				model: MODEL_FOR_SCHEMA_IMPORT,
				mode: "auto",
				schema: database_whiteboard_output_schema,
				temperature: 0,
				system: system_prompt,
				prompt: schema,
				onFinish: async (event) => {
					// console.debug({
					// 	streamObject_onFinish: JSON.stringify(event, null, 2),
					// });

					const update_whiteboard_respone = await updateChatDatabaseWhiteboard(
						chatId,
						event.object.initialNodes,
					);
					console.debug({ update_whiteboard_respone });

					aiState.update({
						...aiState.get(),
						messages: [
							...aiState.get().messages,
							{
								id: generateId(),
								timestamp: new Date().toISOString(),
								role: "system",
								content: systemMessageText,
							},
							{
								id: messageId,
								role: "assistant",
								timestamp: new Date().toISOString(),
								content: "here's the current database whiteboard",
								display: {
									name: "show_database_whiteboard",
									props: {
										messageId,
										initialNodes: event.object.initialNodes,
									},
								},
							},
						],
					});

					console.debug(
						`[importSchema:end_streamObject] - ${Date.now() - timeStart} ms`,
					);
				},
			});

			console.debug(
				`[importSchema:start_streamObject] - ${Date.now() - timeStart} ms`,
			);

			for await (const partialObject of partialObjectStream) {
				stream.update(partialObject);

				console.debug({ partialObject });
			}

			isStreaming.update(false);

			stream.done();
			isStreaming.done();
			aiState.done();
		})();

		return {
			ok: true,
			messageId,
			systemMessageText,
			initialNodes: stream.value,
			isStreaming: isStreaming.value,
		};
	} catch (error) {
		console.error("Failed to import schema: ", error);
		return {
			ok: false,
			error: error?.message,
		};
	}
}

/**
 *
 * @param {string} to - What system we are exporting to. [rails]
 * @param {string} toolResultId - History entry ID of the tool-result
 * @returns
 */
async function exportDatabaseWhiteboard(to, toolResultId) {
	"use server";

	const timeStart = Date.now();

	const exportedUI = createStreamableUI();

	exportedUI.update(<p>Loading...</p>);

	console.log(
		`hello from the server from exportDatabaseWhiteboard. Exporting whiteboard to [${to}] from tool result with id: [${toolResultId}]`,
	);

	const aiState = getMutableAIState().get();

	const toolHistoryEntry = aiState.messages.find(
		(entry) => entry.role === "assistant" && entry.id === toolResultId,
	);
	console.log("Tool History Entry:", toolHistoryEntry);

	if (!toolHistoryEntry) {
		throw new Error(`No history entry with id of ${toolResultId}`);
	}

	switch (to) {
		case "rails": {
			const commands_result = await generateObject({
				model: MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE,
				mode: "auto",
				schema: z.object({
					commands: z.array(
						z.object({
							table_name: z.string(),
							rails_command: z
								.string()
								.describe(
									"RubyOnRails command to generate the corresponding table, columns and etc",
								),
						}),
					),
				}),
				system: `\
			You are a bot that know all about the Ruby-On-Rails framework. You use the results for tool-result from the tool "update_database_whiteboard" and you generate the corresponding
			ruby on rails generate command for each table and their columns, references, etc.
		`,
				prompt: `${JSON.stringify(toolHistoryEntry)}`,
			});

			console.debug({ commands_result });

			exportedUI.done(
				<ExportedDbWhiteboardDialog
					title={"Ruby on Rails"}
					data={commands_result.object}
				/>,
			);
			console.debug(
				`[exportDatabaseWhiteboard:rails] - ${Date.now() - timeStart} ms`,
			);
			break;
		}

		case "sqlite": {
			const result = await generateObject({
				model: MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE,
				mode: "auto",
				schema: z.object({
					sql: z.string().describe("Sqlite sql code"),
				}),
				system: `\
			You are a bot that know all about SQLite. You use the results for tool-result from the tool "update_database_whiteboard" and you generate the corresponding
			SQLite sql query.
		`,
				prompt: `${JSON.stringify(toolHistoryEntry)}`,
			});

			console.debug({ result });

			exportedUI.done(<ExportedToSqliteDialog data={result.object} />);
			console.debug(
				`[exportDatabaseWhiteboard:sqlite] - ${Date.now() - timeStart} ms`,
			);
			break;
		}

		default:
			throw new Error(`${to} is not supported`);
	}

	return { export_to: to, display: exportedUI.value };
}

const initialAIState = { chatId: null, messages: [] };

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
// [{
//   id: number;
//   display: React.ReactNode;
// }]
const initialUIState = [];

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AI = createAI({
	actions: {
		submitUserMessage,
		exportDatabaseWhiteboard,
		importSchema,
	},
	// Each state can be any shape of object, but for chat applications
	// it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
	initialUIState,
	initialAIState,
	onGetUIState: async () => {
		"use server";

		const aiState = getAIState();

		if (aiState) {
			const messagesFromAiState = aiState.messages
				// .filter((message) => message.role !== "system")
				.map((message, index) => ({
					id: `${aiState.chatId}-${index}`,
					display:
						message.role === "user" ? (
							<UserMessage>{message.content}</UserMessage>
						) : message.role === "system" ? (
							<SystemMessage>{message.content}</SystemMessage>
						) : message.role === "assistant" ? (
							message.display?.name === "show_database_whiteboard" ||
							message.display?.name === "update_database_whiteboard" ? (
								<AssistantMessage>
									<DatabaseWhiteboard
										initialNodes={message.display.props.initialNodes}
										initialEdges={[]}
									/>
									<ExportToPopUp
										toolResultId={message.display.props.messageId}
									/>
								</AssistantMessage>
							) : (
								<AssistantMarkdownMessage content={message.content} />
							)
						) : null,
				}));
			// console.log(JSON.stringify(messagesFromAiState, null, 2));
			return messagesFromAiState;
		}
		return;
	},
	onSetAIState: async ({ key, state, done }) => {
		"use server";

		// console.debug(`${new Date().toISOString()}:`);
		// console.debug({ done });
		// console.debug({ key });
		// console.debug(JSON.stringify(state, null, 2));

		const response = await saveChatMessages(state.chatId, state.messages);
		// console.log({ saveChatMessages: response });
		// if (done) {
		// }
		// console.log({ state });
	},
});
