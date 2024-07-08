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
	UserMessage,
} from "@/components/chat/message";
import Whiteboard from "@/components/whiteboard/whiteboard";
import DatabaseWhiteboard from "@/components/database-whiteboard";
import { openai } from "@ai-sdk/openai";
import { nanoid } from "nanoid";
import ExportToPopUp from "@/components/whiteboard/export-to";
import { generateId, generateObject, generateText, streamText } from "ai";
import { wait } from "../utils";
import { ExportedDbWhiteboardDialog } from "@/components/whiteboard/exported-to-rails-dialog";
import { ExportedToSqliteDialog } from "@/components/whiteboard/exported-to-sqlite-dialog";
import {
	createChat,
	getChat,
	isUserRateLimited,
	saveChatMessages,
	updateChatDatabaseWhiteboard,
} from "@/app/actions";

const MODEL_FOR_USER_SUBMITTED_MESSAGES = openai("gpt-3.5-turbo");
const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE = openai("gpt-3.5-turbo");
// const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE = openai("gpt-4o");

const database_whiteboard_output_schema = z.object({
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
									"The table name that this field refers to, if the field is a foreign_key",
								),
							foreign_key_field: z
								.string()
								.optional()
								.describe(
									"A field in the foreign table that this field refers to",
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
				system: `\
				You are a friendly assitant that helps the user with their database architectures, from modeling databases from ideias, to understanding current database modeling/architecture and modifying it.
				
				The UTC date today is ${new Date().toUTCString()}.
				
				You have access to the database_whiteboard, which is where, alongside the user, you will work and present the database architecture/modeling/whiteboard to the user. That means that if the database whiteboard is not empty, every request from the user will use the current database_whiteboard as the source of thruth.

				`,
				tools: {
					update_database_whiteboard: {
						description:
							"View or manipulate the database whiteboard, aka, the representation of the database architecture",
						parameters: database_whiteboard_output_schema,
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
					console.debug({ streamTextResult: JSON.stringify(event, null, 2) });
				},
			});

			let textContent = "";

			spinnerStream.done(null);

			for await (const delta of result.fullStream) {
				const { type, finishReason } = delta;

				if (type === "text-delta") {
					const { textDelta } = delta;

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
				} else if (type === "tool-call") {
					const { toolName, args } = delta;

					if (toolName === "update_database_whiteboard") {
						const { initialNodes } = args;

						const resultId = generateId();

						aiState.done({
							...aiState.get(),
							messages: [
								...aiState.get().messages,
								{
									id: resultId,
									role: "assistant",
									timestamp: new Date().toISOString(),
									content: "here's the current database whiteboard",
									display: {
										name: "update_database_whiteboard",
										props: {
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
					}
				}
			}

			uiStream.done();
			textStream.done();
			messageStream.done();
			aiState.done();
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

/**
 *
 * @param {string} to - What system we are exporting to. [rails]
 * @param {string} toolResultId - History entry ID of the tool-result
 * @returns
 */
async function exportDatabaseWhiteboard(to, toolResultId) {
	"use server";

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
				.filter((message) => message.role !== "system")
				.map((message, index) => ({
					id: `${aiState.chatId}-${index}`,
					display:
						message.role === "user" ? (
							<UserMessage>{message.content}</UserMessage>
						) : message.role === "assistant" ? (
							message.display?.name === "update_database_whiteboard" ? (
								<AssistantMessage>
									<DatabaseWhiteboard
										initialNodes={message.display.props.initialNodes}
										initialEdges={[]}
									/>
									<ExportToPopUp toolResultId={""} />
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
		console.log({ saveChatMessages: response });
		// if (done) {
		// }
		// console.log({ state });
	},
});
