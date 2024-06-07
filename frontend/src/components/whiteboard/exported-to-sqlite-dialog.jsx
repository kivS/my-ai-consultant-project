"use client";

import { Button } from "@/components/ui/button";
import {
	DialogTrigger,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogFooter,
	DialogContent,
	Dialog,
	DialogClose,
} from "@/components/ui/dialog";
import {
	CheckCircledIcon,
	CheckIcon,
	EnvelopeOpenIcon,
} from "@radix-ui/react-icons";
import { IconBookOpenCheck } from "@/components/ui/icons";
import CopyToClipboardButton from "../copy-to-clipboard-button";

export function ExportedToSqliteDialog({ data }) {
	console.log(data);
	return (
		<Dialog defaultOpen={false}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-1">
					SQLite
					<IconBookOpenCheck />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] h-[500px] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Exported code</DialogTitle>
					<DialogDescription>
						Here are the code you can copy to generate your database.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<CopyToClipboardButton data={data?.sql} />

					<div className="overflow-hidden">
						<pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
							<code>{data?.sql}</code>
						</pre>
					</div>
				</div>
				<DialogFooter>
					<DialogClose>
						<Button type="button" variant="ghost">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
