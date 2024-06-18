import { wait } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";

export async function SidebarList() {
	const chats = [];

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<div className="flex-1 overflow-auto">
				{chats?.length ? (
					<div className="space-y-2 px-2">
						{/* <SidebarItems chats={chats} /> */}
					</div>
				) : (
					<div className="p-8 text-center">
						<p className="text-sm text-muted-foreground">No chat history</p>
					</div>
				)}
			</div>
			<div className="flex items-center justify-between p-4">
				<ThemeToggle />
				{/* <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} /> */}
			</div>
		</div>
	);
}
