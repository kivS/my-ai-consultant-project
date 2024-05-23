"use client";

import DatabaseWhiteboard from "@/components/database-whiteboard";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import "reactflow/dist/style.css";
import { ExportedDbWhiteboardDialog } from "@/components/exported-db-whiteboard-dialog";

export default function Test() {
	if (process.env.NODE_ENV !== "development") {
		redirect("/");
	}

	const nodeTypes = useMemo(() => ({ customTableNode: CustomTableNode }), []);

	const initialNodes = [
		{ id: "db_1", position: { x: 0, y: 0 }, data: { label: "database 1" } },
		{ id: "db_2", position: { x: 0, y: 100 }, data: { label: "database 2" } },
		{
			id: "db_3",
			type: "customTableNode",
			position: { x: 0, y: 200 },
			data: { label: "database 3 - hello" },
		},
	];
	const initialEdges = [{ id: "e1-2", source: "db_1", target: "db_2" }];

	const result = {
		commands: [
			{
				table_name: "Restaurants",
				rails_command:
					"rails generate model Restaurant name:string location:string cuisine_type:string rating:integer",
			},
			{
				table_name: "Menu Items",
				rails_command:
					"rails generate model MenuItem name:string description:string price:decimal category:string",
			},
			{
				table_name: "Orders",
				rails_command:
					"rails generate model Order customer_id:integer restaurant_id:integer item_id:integer quantity:integer total_price:decimal status:string",
			},
			{
				table_name: "Customers",
				rails_command:
					"rails generate model Customer name:string contact_info:string loyalty_points:integer",
			},
			{
				table_name: "Employees",
				rails_command:
					"rails generate model Employee name:string role:string contact_info:string schedule:string",
			},
		],
	};
	return (
		<>
			<ExportedDbWhiteboardDialog title={"RubyOnRails 💎"} data={result} />,
			<div className="flex m-8 w-[800px] h-[400px] border p-2 rounded bg-orange-300 text-black">
				<ReactFlow
					nodes={initialNodes}
					edges={initialEdges}
					nodeTypes={nodeTypes}
				>
					{/* <Controls /> */}
					{/* <MiniMap /> */}
					<Background variant="dots" gap={12} size={1} />
				</ReactFlow>
				{/* <DatabaseWhiteboard initialNodes={initialNodes} initialEdges={initialEdges} /> */}
			</div>
			<ExportToPopup />
		</>
	);
}

function ExportToPopup() {
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
							<Button onClick={(e) => console.log("rails!")}>
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
}

function CustomTableNode({ data }) {
	return (
		<>
			<div className="border p-2 rounded">
				<div className="m-2 text-cyan-700 font-bold text-2xl ">
					{data.label}
				</div>
				<ul>
					<li>column 1</li>
					<li>column 2</li>
					<li>column 3</li>
					<li>column 4</li>
					<li>column 5</li>
					<li>column 6</li>
					<li>column 7</li>
					<li>column 8</li>
				</ul>
			</div>
		</>
	);
}
