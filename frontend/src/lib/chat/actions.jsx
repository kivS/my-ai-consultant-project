import "server-only";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { z } from "zod";
import { AssistantMessage, SpinnerMessage } from "@/components/chat/message";
import Whiteboard from "@/components/whiteboard/whiteboard";
import DatabaseWhiteboard from "@/components/database-whiteboard";
import { openai } from "@ai-sdk/openai";
import { nanoid } from "nanoid";

const system_root_prompt = `\
// You are a database architect conversation bot and you can help users model their database architecture, step by step.
// You discuss the database modeling in a high level, only going more detailed when the user asks for it.

// When you come up with a table or tables and their connections you show them to the user
// by calling to show the user by calling  \`update_database_whiteboard\`, here
// you show current state of the database discused with the user: the tables, relationships, etc.

// Besides that, you can also chat with users and do some calculations if needed.`;

// An example of a spinner component. You can also import your own components,
// or 3rd party component libraries.

function Spinner() {
	return <div>Loading...</div>;
}

async function submitUserMessage(userInput) {
	"use server";

	/**
	 * Json context for the LLM
	 */
	const aiState = getMutableAIState();

	// Update the AI state with the new user message.
	aiState.update([
		...aiState.get(),
		{
			id: nanoid(),
			role: "user",
			content: userInput,
		},
	]);

	//  creates a generated, streamable UI.
	const result = await streamUI({
		model: openai("gpt-3.5-turbo"),
		initial: <SpinnerMessage />,
		// system: system_root_prompt,
		messages: [
			{ role: "system", content: system_root_prompt },
			...aiState.get(),
		],
		// `text` is called when an AI returns a text response (as opposed to a tool call).
		// Its content is streamed from the LLM, so this function will be called
		// multiple times with `content` being incremental.
		text: ({ content, done }) => {
			// When it's the final content, mark the state as done and ready for the client to access.
			if (done) {
				aiState.done([
					...aiState.get(),
					{
						id: nanoid(),
						role: "assistant",
						content,
					},
				]);
			}

			return <AssistantMessage>{content}</AssistantMessage>;
			// return <p>{content}</p>;
		},
		tools: {
			update_database_whiteboard: {
				description:
					"Update the whiteboard for the database modeling. it generates the current state of the database based on the conversation context ",
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

					aiState.done([
						...aiState.get(),
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
							id: nanoid(),
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

					// const initialNodes = [
					//   { id: 'db_1', position: { x: 0, y: 0 }, data: { label: 'database 1' } },

					// ];
					// const initialEdges = [{ id: 'e1-2', source: 'db_1', target: 'db_2' }];
					const initialEdges = [];

					return (
						<AssistantMessage>
							<DatabaseWhiteboard
								initialNodes={initialNodes}
								initialEdges={initialEdges}
							/>
						</AssistantMessage>
					);
				},
			},
		},
	});

	return {
		id: Date.now(),
		display: result.value,
	};
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
