"use client";

import { Button } from "@/components/ui/button";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useActions } from "ai/rsc";
import { useState, useTransition } from "react";
import { IconSparklingStar, IconSpinner } from "../ui/icons";

export default function ExportToPopUp({ toolResultId }) {
	const { exportDatabaseWhiteboard } = useActions();
	const [generatedRailsUI, setGeneratedRailsUI] = useState(null);
	const [isPending, startTransition] = useTransition();

	return (
		<div className="flex pt-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="outline" className="flex gap-1">
						<IconSparklingStar className="" />
						Export
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="grid gap-4">
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								Get the code for your favourite system.
							</p>
						</div>

						<div>
							{generatedRailsUI?.export_to === "rails" ? (
								generatedRailsUI.display
							) : (
								<Button
									data-export_to="rails"
									data-tool_result_id={toolResultId}
									onClick={handleClick}
									disabled={isPending}
								>
									Ruby on Rails
									{isPending ? <IconSpinner className="ml-1" /> : ""}
								</Button>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>
			{/* <button type="button" className="rounded border p-2">
					Export to
				</button> */}
		</div>
	);

	/**
	 *
	 * @param {Event} e
	 */
	async function handleClick(e) {
		const export_to = e.target.dataset.export_to;
		const tool_result_id = e.target.dataset.tool_result_id;

		startTransition(async () => {
			const result = await exportDatabaseWhiteboard(export_to, tool_result_id);
			setGeneratedRailsUI(result);
			console.log({ result });
		});
	}
}
