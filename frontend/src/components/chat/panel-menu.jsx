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
import { useState, useTransition } from "react";

import { generateId } from "ai";
import { AssistantMessage, SystemMessage } from "./message";
import DatabaseWhiteboard from "../database-whiteboard";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { useRouter } from "next/navigation";
import ExportToPopUp from "../whiteboard/export-to";
import { revalidatePath } from "next/cache";

export default function PanelMenu({ chatId }) {
	const [popoverIsOpen, setPopoverOpen] = useState(false);

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
				<div className="flex flex-wrap gap-2 ">
					<div className="p-2 ">
						<Link href="/">New Chat</Link>
					</div>

					<div className=" px-2">
						<ImportRailsSchema
							chatId={chatId}
							popoverIsOpen={popoverIsOpen}
							setPopoverOpen={setPopoverOpen}
						/>
					</div>

					<div className=" px-2">
						<ImportPostgresSchema
							chatId={chatId}
							popoverIsOpen={popoverIsOpen}
							setPopoverOpen={setPopoverOpen}
						/>
					</div>

					<div className=" px-2">
						<ImportMicrosoftSql
							chatId={chatId}
							popoverIsOpen={popoverIsOpen}
							setPopoverOpen={setPopoverOpen}
						/>
					</div>

					<div className=" px-2">
						<ImportMySql
							chatId={chatId}
							popoverIsOpen={popoverIsOpen}
							setPopoverOpen={setPopoverOpen}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function ImportMySql({ chatId, popoverIsOpen, setPopoverOpen }) {
	const [isSchemaImportPending, startSchemaImportTransition] = useTransition();
	const [alertIsOpen, setAlertOpen] = useState(false);
	const [_, setMessages] = useUIState();
	const { importSchema } = useActions();

	return (
		<AlertDialog open={alertIsOpen} onOpenChange={setAlertOpen}>
			<AlertDialogTrigger asChild>
				<Button>Import MySQL Schema</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Import Schema</AlertDialogTitle>
					<AlertDialogDescription>
						<p>Add your MySQL schema</p>
					</AlertDialogDescription>
					<div className="my-8">
						<form
							id="mysql_schema_form"
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();

								const formData = new FormData(e.target);

								console.debug(Object.fromEntries(formData));

								const file = formData.get("schema_file");

								const reader = new FileReader();
								reader.onload = async (event) => {
									startSchemaImportTransition(async () => {
										const fileText = event.target.result;
										console.log({ fileText });

										const result = await importSchema(
											chatId,
											"mysql",
											fileText,
										);
										console.deubg({ result });

										if (!result.ok) {
											console.error("failed to import schema. try again...");
											return;
										}

										setMessages((currentMessages) => [
											...currentMessages,
											{
												id: generateId(),
												display: (
													<SystemMessage>
														{result.systemMessageText}
													</SystemMessage>
												),
											},
											{
												id: generateId(),
												display: (
													<AssistantMessage>
														<DatabaseWhiteboard
															initialNodes={result.initialNodes}
															initialEdges={[]}
														/>
														<ExportToPopUp toolResultId={result.messageId} />
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
								accept=".sql"
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
						form="mysql_schema_form"
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
	);
}

function ImportMicrosoftSql({ chatId, popoverIsOpen, setPopoverOpen }) {
	const [isSchemaImportPending, startSchemaImportTransition] = useTransition();
	const [alertIsOpen, setAlertOpen] = useState(false);
	const [_, setMessages] = useUIState();
	const { importSchema } = useActions();

	return (
		<AlertDialog open={alertIsOpen} onOpenChange={setAlertOpen}>
			<AlertDialogTrigger asChild>
				<Button>Import MsSql Schema</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Import Schema</AlertDialogTitle>
					<AlertDialogDescription>
						<p>Add your Microsoft SQL schema</p>
					</AlertDialogDescription>
					<div className="my-8">
						<form
							id="mssql_schema_form"
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();

								const formData = new FormData(e.target);

								console.debug(Object.fromEntries(formData));

								const file = formData.get("schema_file");

								const reader = new FileReader();
								reader.onload = async (event) => {
									startSchemaImportTransition(async () => {
										const fileText = event.target.result;
										console.log({ fileText });

										const result = await importSchema(
											chatId,
											"mssql",
											fileText,
										);
										console.log({ result });

										if (!result.ok) {
											console.error("failed to import schema. try again...");
											return;
										}

										setMessages((currentMessages) => [
											...currentMessages,
											{
												id: generateId(),
												display: (
													<SystemMessage>
														{result.systemMessageText}
													</SystemMessage>
												),
											},
											{
												id: generateId(),
												display: (
													<AssistantMessage>
														<DatabaseWhiteboard
															initialNodes={result.initialNodes}
															initialEdges={[]}
														/>
														<ExportToPopUp toolResultId={result.messageId} />
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
								accept=".sql"
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
						form="mssql_schema_form"
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
	);
}
function ImportPostgresSchema({ chatId, popoverIsOpen, setPopoverOpen }) {
	const [isSchemaImportPending, startSchemaImportTransition] = useTransition();
	const [alertIsOpen, setAlertOpen] = useState(false);
	const [_, setMessages] = useUIState();
	const { importSchema } = useActions();

	return (
		<AlertDialog open={alertIsOpen} onOpenChange={setAlertOpen}>
			<AlertDialogTrigger asChild>
				<Button>Import PostGres Schema</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Import Schema</AlertDialogTitle>
					<AlertDialogDescription>
						<p>Add your PostGRES schema</p>
					</AlertDialogDescription>
					<div className="my-8">
						<form
							id="postgres_schema_form"
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();

								const formData = new FormData(e.target);

								console.debug(Object.fromEntries(formData));

								const file = formData.get("schema_file");

								const reader = new FileReader();
								reader.onload = async (event) => {
									startSchemaImportTransition(async () => {
										const fileText = event.target.result;
										console.log({ fileText });

										const result = await importSchema(
											chatId,
											"postgres",
											fileText,
										);
										console.log({ result });

										if (!result.ok) {
											console.error("failed to import schema. try again...");
											return;
										}

										setMessages((currentMessages) => [
											...currentMessages,
											{
												id: generateId(),
												display: (
													<SystemMessage>
														{result.systemMessageText}
													</SystemMessage>
												),
											},
											{
												id: generateId(),
												display: (
													<AssistantMessage>
														<DatabaseWhiteboard
															initialNodes={result.initialNodes}
															initialEdges={[]}
														/>
														<ExportToPopUp toolResultId={result.messageId} />
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
								accept=".sql"
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
						form="postgres_schema_form"
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
	);
}

function ImportRailsSchema({ chatId, popoverIsOpen, setPopoverOpen }) {
	const [isSchemaImportPending, startSchemaImportTransition] = useTransition();
	const [alertIsOpen, setAlertOpen] = useState(false);
	const [_, setMessages] = useUIState();
	const { importSchema } = useActions();

	return (
		<AlertDialog open={alertIsOpen} onOpenChange={setAlertOpen}>
			<AlertDialogTrigger asChild>
				<Button>Import Rails Schema</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Import Schema</AlertDialogTitle>
					<AlertDialogDescription>
						<p>Add your `schema.rb` from Ruby on Rails</p>
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

										const result = await importSchema(
											chatId,
											"rails",
											fileText,
										);
										console.log({ result });

										for await (const partialObject of readStreamableValue(
											result?.initialNodes,
										)) {
											console.debug({ partialObject });
										}

										if (!result.ok) {
											alert("failed to import schema. try again...");
											console.error("failed to import schema: ", result?.error);
											return;
										}

										// setMessages((currentMessages) => [
										// 	...currentMessages,
										// 	{
										// 		id: generateId(),
										// 		display: (
										// 			<SystemMessage>
										// 				{result.systemMessageText}
										// 			</SystemMessage>
										// 		),
										// 	},
										// 	{
										// 		id: generateId(),
										// 		display: (
										// 			<AssistantMessage>
										// 				<DatabaseWhiteboard
										// 					initialNodes={result.initialNodes}
										// 					initialEdges={[]}
										// 				/>
										// 				<ExportToPopUp toolResultId={result.messageId} />
										// 			</AssistantMessage>
										// 		),
										// 	},
										// ]);

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
								accept=".rb"
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
	);
}
