import { getSessionData } from "@/app/(auth)/actions";
import { getChat, getUserData } from "@/app/actions";
import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }) {
	const session = await getSessionData();

	const user = await getUserData();

	console.debug({ user });

	if (!user?.is_email_verified) {
		redirect("/");
	}

	if (!session) {
		redirect(`/login?next=/chat/${params.id}`);
	}

	const chat = await getChat(params.id);
	// console.log({ chat });

	return (
		<AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
			<Chat id={chat.id} />
		</AI>
	);
}
