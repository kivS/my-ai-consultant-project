import { SidebarDesktop } from "@/components/sidebar-desktop";

export default async function ChatLayout({ children }) {
	return (
		<div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
			<SidebarDesktop />
			{children}
		</div>
	);
}
