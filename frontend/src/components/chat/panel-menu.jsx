import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { IconPlus, IconSpinner } from "../ui/icons";
import Link from "next/link";
import { Input } from "../ui/input";
import { wait } from "@/lib/utils";
import { importSchema } from "@/app/actions";
import { useState, useTransition } from "react";

import { generateId } from "ai";
import { AssistantMessage } from "./message";
import DatabaseWhiteboard from "../database-whiteboard";
import { useUIState } from "ai/rsc";

export default function PanelMenu({ chatId }) {
	const [isSchemaImportPending, startSchemaImportTransition] = useTransition();
	const [_, setMessages] = useUIState();
	const [popoverIsOpen, setPopoverOpen] = useState(false);
	const [alertIsOpen, setAlertOpen] = useState(false);
	return (
		<Popover open={popoverIsOpen} onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
				>
					<IconPlus />
					<span className="sr-only">More options</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex gap-2">
					<div className="p-2 ">
						<Link href="/">New Chat</Link>
					</div>
					<div className=" px-2">
						<AlertDialog open={alertIsOpen} onOpenChange={setAlertOpen}>
							<AlertDialogTrigger asChild>
								<Button>Import Schema</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Import Schema</AlertDialogTitle>
									<AlertDialogDescription>
										<p>Add your schema from Ruby on Rails</p>
									</AlertDialogDescription>
									<div className="my-8">
										<form
											id="rails_schema_form"
											method="post"
											onSubmit={async (e) => {
												e.preventDefault();

												const formData = new FormData(e.target);

												console.log(Object.fromEntries(formData));

												const file = formData.get("schema_file");

												const reader = new FileReader();
												reader.onload = async (event) => {
													startSchemaImportTransition(async () => {
														const fileText = event.target.result;
														console.log({ fileText });

														const result = await importSchema(chatId, fileText);
														console.log({ result });

														if (!result.id) {
															console.error(
																"failed to import schema. try again...",
															);
															return;
														}

														setMessages((currentMessages) => [
															...currentMessages,
															{
																id: generateId(),
																display: (
																	<AssistantMessage>
																		<DatabaseWhiteboard
																			initialNodes={
																				result.whiteboard.initialNodes
																			}
																			initialEdges={[]}
																		/>
																		{/* <ExportToPopUp toolResultId={resultId} /> */}
																	</AssistantMessage>
																),
															},
														]);

														setPopoverOpen(false);
														setAlertOpen(false);
													});
												};

												reader.readAsText(file);
											}}
										>
											<Input
												name="schema_file"
												type="file"
												disabled={isSchemaImportPending}
												required
											/>
										</form>
									</div>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={isSchemaImportPending}>
										Cancel
									</AlertDialogCancel>

									<Button
										type="submit"
										form="rails_schema_form"
										disabled={isSchemaImportPending}
										className="flex gap-1"
									>
										{isSchemaImportPending ? (
											<>
												Importing <IconSpinner />
											</>
										) : (
											<>Continue</>
										)}
									</Button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
