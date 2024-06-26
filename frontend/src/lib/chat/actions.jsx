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
import {
	createChat,
	getChat,
	saveChatMessages,
	updateChatDatabaseWhiteboard,
} from "@/app/actions";

const BOT_MODEL = openai("gpt-3.5-turbo");
// const BOT_MODEL = openai("gpt-4o");

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

	/**
	 * Json context for the LLM
	 */
	const aiState = getMutableAIState();

	let chat = null;

	// console.debug("user submitted a message: ", aiState.get());

	if (!aiState.get().chatId) {
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
				role: "user",
				content: userInput,
			},
		],
	});

	chat = await getChat(aiState.get().chatId);

	const SYSTEM_PROMPT = `\
You are a database architect conversation bot and you can help users model their database architecture, step by step.
You and the user discuss the database modeling in a high level, only going more detailed when the user asks for it.

[ database_whiteboard: ${JSON.stringify(chat.database_whiteboard.whiteboard)} ]
You have access to the current state of the database architecture, aka, database_whiteboard.
If the current state of the database whiteboard is "{}" it just means the whiteboard is empty so you need to start from scratch.
the database_whiteboard is the single source of thruth! any manipulation you do, you do it upon the database_whiteboard using the data that's there!

If the user requests to see or manipulate the database_whiteboard/architecture of the database, call  \`update_database_whiteboard\` to show or manipulate the database_whiteboard.

If you're answering with text(no UI returned) answer with a pretty formatted markdown.

The names of the everything you generate--tables, fields, types, etc--should be SQL complient, also unless instructed otherwise prefer lower snake_case for table names.
Unless instructed otherwise, primary keys on the tables should be named id.

Besides that, you can also chat with the user and do some calculations if needed.`;

	console.debug({ SYSTEM_PROMPT });

	//  creates a generated, streamable UI.
	const result = await streamUI({
		model: BOT_MODEL,
		initial: <SpinnerMessage />,
		system: SYSTEM_PROMPT,
		toolChoice: "auto",
		messages: [...aiState.get().messages],
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
				parameters: database_whiteboard_output_schema,
				generate: async function* ({ initialNodes }) {
					yield <SpinnerMessage />;

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
										args: {},
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
										result: { initialNodes },
									},
								],
							},
						],
					});

					const initialEdges = [];

					const updateWhiteboardResult = await updateChatDatabaseWhiteboard(
						aiState.get().chatId,
						initialNodes,
					);

					console.debug({ updateWhiteboardResult });

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

	const aiState = getMutableAIState().get();

	const toolHistoryEntry = aiState.messages.find(
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

		if (aiState) {
			const messagesFromAiState = aiState.messages
				.filter((message) => message.role !== "system")
				.map((message, index) => ({
					id: `${aiState.chatId}-${index}`,
					display:
						message.role === "tool" ? (
							message.content.map((tool) => {
								return tool.toolName === "update_database_whiteboard" ? (
									<AssistantMessage key={tool.toolCallId}>
										<DatabaseWhiteboard
											initialNodes={tool.result.initialNodes}
											initialEdges={[]}
										/>
										<ExportToPopUp toolResultId={message.id} />
									</AssistantMessage>
								) : null;
							})
						) : message.role === "user" ? (
							<UserMessage>{message.content}</UserMessage>
						) : message.role === "assistant" &&
							typeof message.content === "string" ? (
							<AssistantMarkdownMessage content={message.content} />
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
		// console.debug(JSON.stringify(state, null, 2));

		if (done) {
			const response = await saveChatMessages(state.chatId, state.messages);
			console.log({ saveChatMessages: response });
		}
		// console.log({ state });
	},
});
