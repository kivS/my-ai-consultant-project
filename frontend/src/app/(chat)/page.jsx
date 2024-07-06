import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { nanoid } from "@/lib/utils";
import { generateId } from "ai";
import { getSessionData } from "../(auth)/actions";

export default async function ChatPage({ params }) {
	const session = await getSessionData();

	if (!session) {
		return <HomePage />;
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
			<h1 className="text-center text-2xl">
				Hello! Start by creating an account, it takes less than 5 minutes
			</h1>
		</div>
	);
}
