import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { nanoid } from "@/lib/utils";
import { generateId } from "ai";


export default function ChatPage({ params }) {
	const id = generateId();

	return (
		<AI>
			<Chat id={id} />
		</AI>
	);
}
