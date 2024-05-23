"use client";

import { Button } from "@/components/ui/button";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useActions } from "ai/rsc";

export default function ExportToPopUp({ toolResultId }) {
	const { exportDatabaseWhiteboard } = useActions();

	return (
		<div className="flex justify-center">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline">Export To</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="grid gap-4">
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								Get the code for your favourite system.
							</p>
						</div>

						<div>
							<Button onClick={() => handleClick("rails")}>
								Ruby-on-Rails
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
			{/* <button type="button" className="rounded border p-2">
					Export to
				</button> */}
		</div>
	);

	async function handleClick(to) {
		console.log({ toolResultId });
		const result = await exportDatabaseWhiteboard(to, toolResultId);
		console.log({ result });
	}
}
