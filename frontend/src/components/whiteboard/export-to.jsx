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

	const [generatedRailsDialog, setGeneratedRailsDialog] = useState(null);
	const [isRailsPending, startRailsTransition] = useTransition();

	const [generatedSqliteDialog, setGeneratedSqliteDialog] = useState(null);
	const [isSqlitePending, startSqliteTransition] = useTransition();

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

						<div className="flex flex-wrap gap-5">
							{generatedRailsDialog ? (
								generatedRailsDialog.display
							) : (
								<Button
									data-tool_result_id={toolResultId}
									onClick={async (e) => {
										const export_to = "rails";
										const tool_result_id = e.target.dataset.tool_result_id;

										startRailsTransition(async () => {
											const result = await exportDatabaseWhiteboard(
												export_to,
												tool_result_id,
											);
											setGeneratedRailsDialog(result);
											console.debug({ result });
										});
									}}
									disabled={isRailsPending}
								>
									Ruby on Rails
									{isRailsPending ? <IconSpinner className="ml-1" /> : ""}
								</Button>
							)}

							{generatedSqliteDialog ? (
								generatedSqliteDialog.display
							) : (
								<Button
									data-tool_result_id={toolResultId}
									disabled={isSqlitePending}
									onClick={async (e) => {
										const export_to = "sqlite";
										const tool_result_id = e.target.dataset.tool_result_id;

										startSqliteTransition(async () => {
											const result = await exportDatabaseWhiteboard(
												export_to,
												tool_result_id,
											);
											setGeneratedSqliteDialog(result);
											console.log({ result });
										});
									}}
								>
									SQLite
									{isSqlitePending ? <IconSpinner className="ml-1" /> : ""}
								</Button>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
