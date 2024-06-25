import { getSessionData } from "@/app/(auth)/actions";
import { getChat } from "@/app/actions";
import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";

export default async function ChatPage({ params }) {
	const session = await getSessionData();

	if (!session) {
		redirect(`/login?next=/chat/${params.id}`);
	}

	const chat = await getChat(params.id);
	console.log({ chat });

	return (
		<AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
			<Chat id={chat.id} />
		</AI>
	);
}
