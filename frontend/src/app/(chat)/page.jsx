import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";

export default function ChatPage({ params }) {
	return (
		<AI>
			<Chat />
		</AI>
	);
}
