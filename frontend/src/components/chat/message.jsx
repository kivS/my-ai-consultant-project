"use client";
/**
 *   Different types of message bubbles.
 */

import { IconOpenAI, IconUser } from "@/components/ui/icons";

export function UserMessage({ children }) {
	return (
		<div className="group relative flex items-start md:-ml-12">
			<div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
				<IconUser />
			</div>
			<div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
				{children}
			</div>
		</div>
	);
}

export function AssistantMessage({ children }) {
	return (
		<div className="group relative flex items-start md:-ml-12">
			<div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
				<IconOpenAI />
			</div>
			<div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
				{children}
			</div>
		</div>
	);
}

export function SpinnerMessage() {
	return (
		<div className="group relative flex items-start md:-ml-12">
			<div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
				<IconOpenAI />
			</div>
			<div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
				<svg
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					viewBox="0 0 24 24"
					strokeLinecap="round"
					strokeLinejoin="round"
					xmlns="http://www.w3.org/2000/svg"
					className="size-5 animate-spin stroke-zinc-400"
				>
					<title>loading...</title>
					<path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12" />
				</svg>
			</div>
		</div>
	);
}
