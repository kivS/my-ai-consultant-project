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
import { IconPlus } from "../ui/icons";
import Link from "next/link";
import { Input } from "../ui/input";
import { wait } from "@/lib/utils";
import { importSchema } from "@/app/actions";

export default function PanelMenu() {
	return (
		<Popover>
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
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									onClick={() => {
										console.log("poooop");
									}}
								>
									Import Schema
								</Button>
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
													const fileText = event.target.result;
													console.log({ fileText });

													const result = await importSchema(fileText);
													console.log({ result });
												};

												reader.readAsText(file);
											}}
										>
											<Input name="schema_file" type="file" />
										</form>
									</div>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>

									<Button type="submit" form="rails_schema_form">
										Continue
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
