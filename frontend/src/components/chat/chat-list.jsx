import { Separator } from "@/components/ui/separator";

export function ChatList({ messages }) {
	if (!messages.length) {
		return null;
	}

	return (
		<div className="relative mx-auto max-w-2xl px-4">
			{messages.map((message, index) => (
				<div key={message.id}>
					{message.spinner}
					{message.display}
					{message.attachments}
					{index < messages.length - 1 && <Separator className="my-4" />}
				</div>
			))}
		</div>
	);
}
