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
import { generateId, generateObject, generateText } from "ai";
import { wait } from "../utils";
import { ExportedDbWhiteboardDialog } from "@/components/whiteboard/exported-to-rails-dialog";
import { ExportedToSqliteDialog } from "@/components/whiteboard/exported-to-sqlite-dialog";
import { createChat, saveChatMessages } from "@/app/actions";

const BOT_MODEL = openai("gpt-3.5-turbo");
// const BOT_MODEL = openai("gpt-4o");

const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE = openai("gpt-3.5-turbo");
// const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD_TO_CODE = openai("gpt-4o");
const SYSTEM_ROOT_PROMPT = `\
You are a database architect conversation bot and you can help users model their database architecture, step by step.
You and the user discuss the database modeling in a high level, only going more detailed when the user asks for it.

If the user requests to see, create, modify, delete the database architecture, call  \`update_database_whiteboard\` to show/modify the database architecture.

If you're answering with text(no UI returned) answer with a pretty formatted markdown.

The names of the everything you generate--tables, fields, types, etc--should be SQL complient, also unless instructed otherwise prefer lower snake_case for table names.
Unless instructed otherwise, primary keys on the tables should be named id.


Besides that, you can also chat with the user and do some calculations if needed.`;

function Spinner() {
	return <div>Loading...</div>;
}

async function submitUserMessage(userInput) {
	"use server";

	/**
	 * Json context for the LLM
	 */
	const aiState = getMutableAIState();

	console.debug("user submitted a message: ", aiState.get());

	if (!aiState.get().chatId) {
		console.debug("No chatId, must be a new chat. Creating a new chat...");

		const chat = await createChat({
			title: userInput.substring(0, 100),
		});

		console.log({ chat });

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
				role: "user",
				content: userInput,
			},
		],
	});

	//  creates a generated, streamable UI.
	const result = await streamUI({
		model: BOT_MODEL,
		initial: <SpinnerMessage />,
		system: SYSTEM_ROOT_PROMPT,
		messages: [
			// { role: "system", content: system_root_prompt },
			...aiState.get().messages,
		],
		// `text` is called when an AI returns a text response (as opposed to a tool call).
		// Its content is streamed from the LLM, so this function will be called
		// multiple times with `content` being incremental.
		text: ({ content, done }) => {
			if (done) {
				aiState.done({
					...aiState.get(),
					messages: [
						...aiState.get().messages,
						{
							id: generateId(),
							role: "assistant",
							content,
						},
					],
				});
			}

			return <AssistantMarkdownMessage content={content} />;
		},
		tools: {
			update_database_whiteboard: {
				description:
					"Update the whiteboard for the database modeling or to show the current state of everything so far. it generates the current state of the database based on the conversation context ",
				parameters: z.object({
					initialNodes: z
						.array(
							z.object({
								id: z
									.string()
									.describe(
										"ID for the node, representing the table, eg: table_name",
									),
								type: z
									.literal("dbTableNode")
									.describe("Type of the node used. node types: dbTableNode "),

								position: z.object({
									x: z
										.number()
										.describe("the position of the node in the x axis"),
									y: z
										.number()
										.describe("the position of the node in the y axis"),
								}),
								data: z.object({
									name: z.string().describe("the name of the table"),
									columns: z.array(
										z.object({
											id: z
												.string()
												.describe(
													"Numerical id that identifies the column. Unique",
												),
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
				}),
				generate: async function* ({ initialNodes }) {
					yield <Spinner />;

					const toolCallId = generateId();

					const toolResultId = generateId();

					aiState.done({
						...aiState.get(),
						messages: [
							...aiState.get().messages,
							{
								id: generateId(),
								role: "assistant",
								content: [
									{
										type: "tool-call",
										toolName: "update_database_whiteboard",
										toolCallId,
										args: { initialNodes },
									},
								],
							},
							{
								id: toolResultId,
								role: "tool",
								content: [
									{
										type: "tool-result",
										toolName: "update_database_whiteboard",
										toolCallId,
										result: initialNodes,
									},
								],
							},
						],
					});

					const initialEdges = [];

					return (
						<AssistantMessage>
							<DatabaseWhiteboard
								initialNodes={initialNodes}
								initialEdges={initialEdges}
							/>
							<ExportToPopUp toolResultId={toolResultId} />
						</AssistantMessage>
					);
				},
			},
		},
	});

	return {
		id: generateId(),
		display: result.value,
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

	const history = getMutableAIState().get();

	const toolHistoryEntry = history.find(
		(entry) => entry.role === "tool" && entry.id === toolResultId,
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

			console.log({ commands_result });

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

			console.log({ result });

			exportedUI.done(<ExportedToSqliteDialog data={result.object} />);
			break;
		}

		default:
			throw new Error(`${to} is not supported`);
	}

	return { export_to: to, display: exportedUI.value };
}

// Define the initial state of the AI. It can be any JSON object.
// [{
//   role: 'user' | 'assistant' | 'system' | 'function';
//   content: string;
//   id ?: string;
//   name ?: string;
// }]
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

		console.debug({ aiState });

		if (aiState) {
			const messagesFromAiState = aiState.messages
				.filter((message) => message.role !== "system")
				.map((message, index) => ({
					id: `${aiState.chatId}-${index}`,
					display:
						message.role === "tool" ? null : message.role === "user" ? (
							//   message.content.map(tool => {
							//     return tool.toolName === 'listStocks' ? (
							//       <BotCard>
							//         {/* TODO: Infer types based on the tool result*/}
							//         {/* @ts-expect-error */}
							//         <Stocks props={tool.result} />
							//       </BotCard>
							//     ) : tool.toolName === 'showStockPrice' ? (
							//       <BotCard>
							//         {/* @ts-expect-error */}
							//         <Stock props={tool.result} />
							//       </BotCard>
							//     ) : tool.toolName === 'showStockPurchase' ? (
							//       <BotCard>
							//         {/* @ts-expect-error */}
							//         <Purchase props={tool.result} />
							//       </BotCard>
							//     ) : tool.toolName === 'getEvents' ? (
							//       <BotCard>
							//         {/* @ts-expect-error */}
							//         <Events props={tool.result} />
							//       </BotCard>
							//     ) : null
							//   })
							<UserMessage>{message.content}</UserMessage>
						) : message.role === "assistant" &&
							typeof message.content === "string" ? (
							<AssistantMarkdownMessage content={message.content} />
						) : null,
				}));

			return messagesFromAiState;
		}
		return;
	},
	onSetAIState: async ({ key, state, done }) => {
		"use server";

		console.debug({ key });
		console.log({ done });
		console.debug(`${new Date().toISOString()} - `, { state });

		if (done) {
			const response = await saveChatMessages(state.chatId, state.messages);
			console.log({ response });
		}
		// console.log({ state });
	},
});
