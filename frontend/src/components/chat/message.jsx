"use client";
/**
 *   Different types of message bubbles.
 */

import { IconOpenAI, IconOrigami, IconUser } from "@/components/ui/icons";
import { useStreamableText } from "@/hooks/use-streamable-text";
import { MemoizedReactMarkdown } from "../markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useEffect, useState } from "react";
import { readStreamableValue } from "ai/rsc";

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
				<IconOrigami />
			</div>
			<div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
				{children}
			</div>
		</div>
	);
}

export function SystemMessage({ children }) {
	return (
		<div className="group relative flex items-start">
			<div className="text-sm text-muted-foreground font-semibold flex-1 space-y-2 text-center overflow-hidden">
				{children}
			</div>
		</div>
	);
}

export function AssistantMarkdownMessage({ content }) {
	// const [generationText, setGenerationText] = useState("");
	console.log(content);
	// const text = useStreamableText(content);
	// console.log(text);

	// useEffect(() => {
	// 	async function getData() {
	// 		for await (const delta of readStreamableValue(content)) {
	// 			setGenerationText((current) => `${current}${delta}`);
	// 			console.log(delta);
	// 		}
	// 	}

	// 	getData();
	// }, []);

	return (
		<div className="group relative flex items-start md:-ml-12">
			<div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
				<IconOrigami />
			</div>
			<div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
				{/* {content} */}

				<MemoizedReactMarkdown
					className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
					remarkPlugins={[remarkGfm, remarkMath]}
					components={{
						p({ children }) {
							return <p className="my-2 last:mb-0">{children}</p>;
						},
						code({ node, inline, className, children, ...props }) {
							if (children.length) {
								// if (children[0] === "▍") {
								// 	return (
								// 		<span className="mt-1 animate-pulse cursor-default">▍</span>
								// 	);
								// }
								// children[0] = children[0].replace("`▍`", "▍");
							}

							const match = /language-(\w+)/.exec(className || "");

							if (inline) {
								return (
									<code className={className} {...props}>
										{children}
									</code>
								);
							}

							return (
								<code>{children}</code>
								// <CodeBlock
								// 	key={Math.random()}
								// 	language={(match && match[1]) || ""}
								// 	value={String(children).replace(/\n$/, "")}
								// 	{...props}
								// />
							);
						},
					}}
				>
					{content}
				</MemoizedReactMarkdown>
			</div>
		</div>
	);
}

export function SpinnerMessage() {
	return (
		<div className="group relative flex items-start md:-ml-12">
			<div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
				<IconOrigami />
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
