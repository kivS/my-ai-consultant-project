"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SidebarItem } from "./sidebar-item";

export function SidebarItems({ chats }) {
	if (!chats?.length) return null;

	return (
		<AnimatePresence>
			{chats.map(
				(chat, index) =>
					chat && (
						<motion.div
							key={chat?.id}
							exit={{
								opacity: 0,
								height: 0,
							}}
						>
							<SidebarItem index={index} chat={chat} />
						</motion.div>
					),
			)}
		</AnimatePresence>
	);
}
