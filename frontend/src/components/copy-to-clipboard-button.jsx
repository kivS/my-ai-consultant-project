"use client";

import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

export default function CopyToClipboardButton({ data }) {
	return (
		<Button
			size="icon"
			variant="ghost"
			data-copy_text={data}
			className="group"
			onClick={async (e) => {
				const copy_btn = e.currentTarget;
				const command_to_copy = copy_btn.dataset.copy_text;
				console.log({ command_to_copy });

				if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
					return;
				}

				if (!command_to_copy) {
					return;
				}

				navigator.clipboard.writeText(command_to_copy).then(() => {
					copy_btn.dataset.copied = true;
					setTimeout(() => {
						delete copy_btn.dataset.copied;
					}, 2000);
				});
			}}
		>
			<CopyIcon className="w-4 h-4 group-data-[copied]:hidden" />
			<CheckIcon className="hidden w-4 text-green-500 h-4 group-data-[copied]:block" />
		</Button>
	);
}
