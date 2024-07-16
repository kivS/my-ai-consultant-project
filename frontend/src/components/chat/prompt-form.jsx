"use client";

import * as React from "react";
import Textarea from "react-textarea-autosize";

import { Button } from "@/components/ui/button";
import { IconArrowElbow, IconPlus } from "@/components/ui/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRouter } from "next/navigation";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "@/lib/utils";
import { SpinnerMessage, UserMessage } from "@/components/chat/message";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { generateId } from "ai";
import Link from "next/link";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Input } from "../ui/input";
import PanelMenu from "./panel-menu";

export function PromptForm({ id, input, setInput }) {
	const router = useRouter();
	const { formRef, onKeyDown } = useEnterSubmit();
	const inputRef = React.useRef(null);

	/**
	 *
	 */
	const { submitUserMessage } = useActions();

	const [_, setMessages] = useUIState();

	React.useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<form
			ref={formRef}
			onSubmit={async (e) => {
				e.preventDefault();

				// Blur focus on mobile
				if (window.innerWidth < 600) {
					e.target["message"]?.blur();
				}

				const value = input.trim();
				setInput("");
				if (!value) return;

				console.log(value);

				// Optimistically add user message UI.
				// Add user message to UI state. This is client-side only so no state is updated to the backend
				setMessages((currentMessages) => [
					...currentMessages,
					{
						id: generateId(),
						display: <UserMessage>{value}</UserMessage>,
					},
					// { id: nanoid(), temp: true, display: <SpinnerMessage /> },
				]);

				// Submit and get response message
				const responseMessage = await submitUserMessage(value);

				// let's remove the temp Spinner message before loading in the result message
				// setMessages((currentMessages) => {
				// 	if (currentMessages[currentMessages.length - 1]?.temp) {
				// 		currentMessages.pop();
				// 	}
				// 	return [...currentMessages];
				// });

				setMessages((currentMessages) => [...currentMessages, responseMessage]);
			}}
		>
			<div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
				<PanelMenu chatId={id} />

				<Textarea
					ref={inputRef}
					tabIndex={0}
					onKeyDown={onKeyDown}
					placeholder="Send a message."
					autoFocus
					spellCheck={false}
					autoComplete="off"
					autoCorrect="off"
					name="message"
					rows={1}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
				/>
				<div className="absolute right-0 top-[13px] sm:right-4">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="submit" size="icon" disabled={input === ""}>
								<IconArrowElbow />
								<span className="sr-only">Send message</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Send message</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</form>
	);
}
