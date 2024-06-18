"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function Sidebar({ className, children }) {
	const { isSidebarOpen, isLoading } = useSidebar();

	return (
		<div
			data-state={isSidebarOpen && !isLoading ? "open" : "closed"}
			className={cn(className, "h-full flex-col dark:bg-zinc-950")}
		>
			{children}
		</div>
	);
}
