import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { nanoid } from "@/lib/utils";
import { generateId } from "ai";

export default function ChatPage({ params }) {
	return (
		<AI initialAIState={{ chatId: null, messages: [] }}>
			<Chat />
		</AI>
	);
}
