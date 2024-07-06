import { Chat } from "@/components/chat/main";
import { AI } from "@/lib/chat/actions";
import { nanoid } from "@/lib/utils";
import { generateId } from "ai";
import { getSessionData } from "../(auth)/actions";
import { IconUser } from "@/components/ui/icons";
import { getUserData } from "../actions";

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
			<h1 className="text-center text-2xl">
				Hello! Start by creating an account, it takes less than 5 minutes!!!
			</h1>
		</div>
	);
}
