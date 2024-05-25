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
} from "@/components/ui/dialog";
import { CheckCircledIcon, CheckIcon } from "@radix-ui/react-icons";

export function ExportedDbWhiteboardDialog({ title, data }) {
	console.log(data);
	return (
		<Dialog defaultOpen={false}>
			<DialogTrigger asChild>
				<Button variant="outline">{title}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] h-[500px] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Copy Commands</DialogTitle>
					<DialogDescription>
						Here are some useful commands you can copy.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{/* {Array.from({ length: 10 }, (_, index) => ( */}
					{data?.commands.map((command) => (
						<div key={command.table_name}>
							<h3 className="font-semibold mb-2">{command.table_name}</h3>
							<div className="grid grid-cols-[1fr_auto] items-center gap-4">
								<div className="max-[100%] overflow-x-hidden">
									<pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
										<code>{command.rails_command}</code>
									</pre>
								</div>
								<Button
									size="icon"
									variant="ghost"
									data-copy_text={command.rails_command}
									className="group"
									onClick={async (e) => {
										const copy_btn = e.currentTarget;
										const command_to_copy = copy_btn.dataset.copy_text;
										console.log({ command_to_copy });

										if (
											typeof window === "undefined" ||
											!navigator.clipboard?.writeText
										) {
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
							</div>
						</div>
					))}
				</div>
				<DialogFooter>
					<Button type="button" variant="ghost">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CopyIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Copy</title>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</svg>
	);
}
