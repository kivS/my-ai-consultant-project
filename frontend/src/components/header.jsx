import * as React from "react";
import Link from "next/link";

import { cn, wait } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	IconGitHub,
	IconMessage,
	IconNextChat,
	IconOrigami,
	IconSeparator,
	IconUser,
	IconVercel,
} from "@/components/ui/icons";
import { ModeToggle } from "./theme-toggle";
import { SidebarToggle } from "./sidebar/sidebar-toggle";
import { SidebarMobile } from "./sidebar/sidebar-mobile";
import { ChatHistory } from "./sidebar/chat-history";
import { getSessionData } from "@/app/(auth)/actions";
import { UserMenu } from "./user-menu";
import { getUserData } from "@/app/actions";

export function Header() {
	return (
		<header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
			<div className="flex items-center">
				<React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
					<UserOrLogin />
				</React.Suspense>
			</div>
		</header>
	);
}

async function UserOrLogin() {
	const session = await getSessionData();
	const user = await getUserData();

	return (
		<>
			{session ? (
				<>
					<SidebarMobile>
						<ChatHistory userId={1} />
					</SidebarMobile>

					<SidebarToggle />
				</>
			) : (
				<Link href="/new" rel="nofollow">
					<IconOrigami className="size-6 mr-2 dark:hidden" inverted />
					<IconOrigami className="hidden size-6 mr-2 dark:block" />
				</Link>
			)}
			<div className="flex items-center">
				<IconSeparator className="size-6 text-muted-foreground/50" />
				{session ? (
					<UserMenu user={user} />
				) : (
					<>
						<Button variant="link" asChild className="-ml-2">
							<Link href="/login">Login</Link>
						</Button>
						<Button variant="link" asChild className="-ml-2">
							<Link href="/register">Sign Up</Link>
						</Button>
					</>
				)}
			</div>
		</>
	);
}
