import "server-only";

import {
	createAI,
	createStreamableUI,
	createStreamableValue,
	getMutableAIState,
	streamUI,
} from "ai/rsc";
import { z } from "zod";
import {
	AssistantMarkdownMessage,
	AssistantMessage,
	SpinnerMessage,
} from "@/components/chat/message";
import Whiteboard from "@/components/whiteboard/whiteboard";
import DatabaseWhiteboard from "@/components/database-whiteboard";
import { openai } from "@ai-sdk/openai";
import { nanoid } from "nanoid";
import ExportToPopUp from "@/components/whiteboard/export-to";
import { generateObject, generateText } from "ai";
import { wait } from "../utils";
import { ExportedDbWhiteboardDialog } from "@/components/exported-db-whiteboard-dialog";

const BOT_MODEL = openai("gpt-3.5-turbo");
const MODEL_TO_GENERATE_EXPORTED_WHITEBOARD = openai("gpt-3.5-turbo");

const system_root_prompt = `\
You are a database architect conversation bot and you can help users model their database architecture, step by step.
You discuss the database modeling in a high level, only going more detailed when the user asks for it.

When you come up with a table or tables and their connections you show them to the user
by calling to show the user by calling  \`update_database_whiteboard\`, here
you show current state of the database discused with the user: the tables, relationships, etc. You can also call \`update_database_whiteboard\`
when the user wants to see the current state of everything.

The names of the everything you generate--tables, fields, types, etc--should be SQL complient, also unless instructed otherwise prefer lower snake_case for table names.
Unless instructed otherwise, primary keys on the tables should be named id.

Besides that, you can also chat with users and do some calculations if needed.`;

function Spinner() {
	return <div>Loading...</div>;
}

async function submitUserMessage(userInput) {
	"use server";

	/**
	 * Json context for the LLM
	 */
	const history = getMutableAIState();

	// Update the AI state with the new user message.
	history.update([
		...history.get(),
		{
			id: nanoid(),
			role: "user",
			content: userInput,
		},
	]);

	//  creates a generated, streamable UI.
	const result = await streamUI({
		model: BOT_MODEL,
		initial: <SpinnerMessage />,
		system: system_root_prompt,
		messages: [
			// { role: "system", content: system_root_prompt },
			...history.get(),
		],
		// `text` is called when an AI returns a text response (as opposed to a tool call).
		// Its content is streamed from the LLM, so this function will be called
		// multiple times with `content` being incremental.
		text: ({ content, done }) => {
			if (done) {
				history.done([
					...history.get(),
					{
						id: nanoid(),
						role: "assistant",
						content,
					},
				]);
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

					const toolCallId = nanoid();

					const toolResultId = nanoid();

					history.done([
						...history.get(),
						{
							id: nanoid(),
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
					]);

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
		id: nanoid(),
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

	const tstUI = createStreamableUI();

	tstUI.update(<p>Loading...</p>);

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

	const commands_result = await generateObject({
		model: MODEL_TO_GENERATE_EXPORTED_WHITEBOARD,
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
			ruby on rails generate command for each table and their columns, etc
		`,
		prompt: `${JSON.stringify(toolHistoryEntry)}`,
	});

	console.log({ commands_result });

	tstUI.done(
		<ExportedDbWhiteboardDialog
			title={"Ruby on Rails"}
			data={commands_result.object}
		/>,
	);

	return { export_to: to, display: tstUI.value };
}

// Define the initial state of the AI. It can be any JSON object.
// [{
//   role: 'user' | 'assistant' | 'system' | 'function';
//   content: string;
//   id ?: string;
//   name ?: string;
// }]
const initialAIState = [];

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
	onSetAIState: async ({ state }) => {
		"use server";

		console.log(`${new Date().toISOString()} - `, { state });
		// console.log({ state });
	},
});
