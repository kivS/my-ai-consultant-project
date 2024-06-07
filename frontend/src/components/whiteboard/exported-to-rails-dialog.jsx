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
import { IconBookOpenCheck } from "../ui/icons";
import CopyToClipboardButton from "../copy-to-clipboard-button";

export function ExportedDbWhiteboardDialog({ data }) {
	console.log(data);
	return (
		<Dialog defaultOpen={false}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-1">
					Ruby On Rails
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
					{data?.commands.map((command) => (
						<div key={command.table_name}>
							<h3 className="font-semibold mb-2">{command.table_name}</h3>
							<div className="grid grid-cols-[1fr_auto] items-center gap-4">
								<div className="max-[100%] overflow-x-hidden">
									<pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
										<code>{command.rails_command}</code>
									</pre>
								</div>
								<CopyToClipboardButton data={command.rails_command} />
							</div>
						</div>
					))}
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
