"use client";

import { cn } from "@/lib/utils";
import { EmptyScreen } from "@/components/chat/empty-screen";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/panel";

import { useUIState, useActions, useAIState } from "ai/rsc";
import { ChatList } from "@/components/chat/chat-list";
import { ExportedDbWhiteboardDialog } from "../whiteboard/exported-to-rails-dialog";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function Chat({ id, className, session, missingKeys }) {
	const router = useRouter();
	const path = usePathname();
	const [input, setInput] = useState("");
	const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
		useScrollAnchor();

	const [messages] = useUIState();
	const [aiState] = useAIState();

	const [_, setNewChatId] = useLocalStorage("newChatId", id);

	console.debug({ messages });

	//  let's add the chatId to the url when the chat is new and was just created
	useEffect(() => {
		if (aiState.chatId && !path.includes("chat")) {
			window.history.replaceState({}, "", `/chat/${aiState.chatId}`);
		}
	}, [path, aiState.chatId]);

	// useEffect(() => {
	// 	const messagesLength = aiState.messages?.length;
	// 	if (messagesLength === 2) {
	// 		router.refresh();
	// 	}
	// }, [aiState.messages, router]);

	useEffect(() => {
		setNewChatId(id);
	});

	return (
		<div
			ref={scrollRef}
			className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
		>
			<div
				ref={messagesRef}
				className={cn("pb-[200px] pt-4 md:pt-10", className)}
			>
				{messages.length ? <ChatList messages={messages} /> : <EmptyScreen />}
				<div ref={visibilityRef} className="h-px w-full" />
			</div>
			<ChatPanel
				id={id}
				input={input}
				setInput={setInput}
				isAtBottom={isAtBottom}
				scrollToBottom={scrollToBottom}
			/>
		</div>
	);
}
