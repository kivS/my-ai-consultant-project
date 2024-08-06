import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { nanoid } from "@/lib/utils";
import { generateId } from "ai";
import { getSessionData } from "../(auth)/actions";
import { IconUser } from "@/components/ui/icons";
import { getUserData } from "../actions";
import Script from "next/script";

export default async function ChatPage({ params }) {
	const session = await getSessionData();

	if (!session) {
		return <HomePage />;
	}

	const user = await getUserData();

	console.log({ user });

	if (!user?.is_email_verified) {
		return (
			<div className="w-2/3 mx-auto my-20">
				<div className="text-lg border mr-8 p-2 justify-center items-center  flex gap-2 rounded border-white bg-orange-500 text-white font-semibold">
					<IconUser className="animate-pulse" /> Check your emailbox for the
					verification email to continue
				</div>
			</div>
		);
	}

	return (
		<AI initialAIState={{ chatId: null, messages: [] }}>
			<Chat id={null} />
		</AI>
	);
}

function HomePage() {
	return (
		<div className="container py-20">
			<h1 className="text-center text-4xl font-bold mb-4">
				Your Database Design Copilot
			</h1>
			<h2 className="text-center text-2xl">
				Streamline Database Design, Management, and Evolution
			</h2>
			{process.env.NODE_ENV === "production" && (
				<Script
					src="https://umami.arm.vikborges.com/script.js"
					data-website-id="24f5a451-3e53-4a1e-bf4a-b7bc6faea873"
					strategy="afterInteractive"
				/>
			)}
		</div>
	);
}
