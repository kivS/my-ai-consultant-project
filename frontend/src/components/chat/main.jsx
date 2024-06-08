"use client";

import { cn } from "@/lib/utils";
import { EmptyScreen } from "@/components/chat/empty-screen";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/panel";

import { useUIState, useActions } from "ai/rsc";
import { ChatList } from "@/components/chat/chat-list";
import { ExportedDbWhiteboardDialog } from "../whiteboard/exported-to-rails-dialog";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";

export function Chat({ id, className, session, missingKeys }) {
	const router = useRouter();
	const path = usePathname();
	const [input, setInput] = useState("");
	const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
		useScrollAnchor();

	/**
	 * Data and UI sent by LLM. Client-side only
	 */
	const [messages, _] = useUIState();

	console.log({ messages });

	return (
		<div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
			<div
				ref={scrollRef}
				className="scrollRefHere group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
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
		</div>
	);
}
