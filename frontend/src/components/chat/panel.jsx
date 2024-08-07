import * as React from "react";

import { PromptForm } from "@/components/chat/prompt-form";
import { ButtonScrollToBottom } from "../button-scroll-to-bottom";

export function ChatPanel({
	id,
	title,
	input,
	setInput,
	isAtBottom,
	scrollToBottom,
}) {
	// const exampleMessages = [
	//   {
	//     heading: 'What are the',
	//     subheading: 'trending memecoins today?',
	//     message: `What are the trending memecoins today?`
	//   },
	//   {
	//     heading: 'What is the price of',
	//     subheading: '$DOGE right now?',
	//     message: 'What is the price of $DOGE right now?'
	//   },
	//   {
	//     heading: 'I would like to buy',
	//     subheading: '42 $DOGE',
	//     message: `I would like to buy 42 $DOGE`
	//   },
	//   {
	//     heading: 'What are some',
	//     subheading: `recent events about $DOGE?`,
	//     message: `What are some recent events about $DOGE?`
	//   }
	// ]

	return (
		<div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
			<ButtonScrollToBottom
				isAtBottom={isAtBottom}
				scrollToBottom={scrollToBottom}
			/>

			<div className="mx-auto sm:max-w-2xl sm:px-4">
				<div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
					<PromptForm id={id} input={input} setInput={setInput} />
				</div>
			</div>
		</div>
	);
}
