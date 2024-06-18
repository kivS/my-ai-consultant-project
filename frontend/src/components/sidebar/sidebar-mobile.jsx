"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Sidebar } from "@/components/sidebar/main";
import { Button } from "@/components/ui/button";

import { IconSidebar } from "@/components/ui/icons";

export function SidebarMobile({ children }) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" className="-ml-2 flex size-9 p-0 lg:hidden">
					<IconSidebar className="size-6" />
					<span className="sr-only">Toggle Sidebar</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
			>
				<Sidebar className="flex">{children}</Sidebar>
			</SheetContent>
		</Sheet>
	);
}
