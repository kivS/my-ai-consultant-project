import 'server-only'

import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { SpinnerMessage } from "@/components/chat/message";
import Whiteboard from '@/components/whiteboard/whiteboard';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// const system_root_prompt = `\
// You are a stock trading conversation bot and you can help users buy stocks, step by step.
// You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.

// Messages inside [] means that it's a UI element or a user event. For example:
// - "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
// - "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.

// If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
// If the user just wants the price, call \`show_stock_price\` to show the price.
// If you want to show trending stocks, call \`list_stocks\`.
// If you want to show events, call \`get_events\`.
// If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.

// Besides that, you can also chat with users and do some calculations if needed.`

const system_root_prompt = `You are a flight assistant`

// An example of a spinner component. You can also import your own components,
// or 3rd party component libraries.
function Spinner() {
  return <div>Loading...</div>;
}


// An example of a function that fetches flight information from an external API.
async function getFlightInfo(flightNumber) {
  return {
    flightNumber,
    departure: 'New York',
    arrival: 'San Francisco',
  };
}

async function submitUserMessage(userInput) {
  'use server';

  /**
   * Json contenxt for the LLM
   */
  const aiState = getMutableAIState();

  // Update the AI state with the new user message.
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content: userInput,
    },
  ]);

  // The `render()` creates a generated, streamable UI.
  const ui = render({
    // model: 'gpt-4-0125-preview',
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      { role: 'system', content: system_root_prompt },
      ...aiState.get()
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
            role: "assistant",
            content
          }
        ]);
      }

      return <p>{content}</p>
    },
    tools: {
      get_flight_info: {
        description: 'Get the information for a flight',
        parameters: z.object({
          flightNumber: z.string().describe('the number of the flight')
        }).required(),
        render: async function* ({ flightNumber }) {
          // Show a spinner on the client while we wait for the response.
          yield <Spinner />

          // Fetch the flight information from an external API.
          const flightInfo = await getFlightInfo(flightNumber)

          // Update the final AI state.
          aiState.done([
            ...aiState.get(),
            {
              role: "function",
              name: "get_flight_info",
              // Content can be any string to provide context to the LLM in the rest of the conversation.
              content: JSON.stringify(flightInfo),
            }
          ]);

          // Return the flight card to the client.
          return <Whiteboard flightInfo={flightInfo} />
        }
      }
    }
  })

  return {
    id: Date.now(),
    display: ui
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
    submitUserMessage
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState
});