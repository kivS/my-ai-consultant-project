"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/hooks/use-sidebar";

export function Providers({ children, ...props }) {
	return (
		<NextThemesProvider {...props}>
			<SidebarProvider>
				<TooltipProvider>{children}</TooltipProvider>
			</SidebarProvider>
		</NextThemesProvider>
	);
}
