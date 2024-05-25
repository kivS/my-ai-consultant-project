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

	const initialNodes = [
		{
			id: "restaurants",
			type: "dbTableNode",
			position: { x: 0, y: 0 },
			data: {
				name: "restaurants",
				columns: [
					{ id: 1, name: "id" },
					{ id: 2, name: "name" },
					{ id: 3, name: "location" },
				],
			},
		},
		{
			id: "customers",
			type: "dbTableNode",
			position: { x: 200, y: 0 },
			data: { name: "customers" },
		},
		{
			id: "employees",
			type: "dbTableNode",
			position: { x: 400, y: 0 },
			data: {
				name: "employees",
				columns: [
					{ id: 1, name: "id" },
					{ id: 2, name: "name" },
					{ id: 3, name: "restaurant_id" },
				],
			},
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
			<ExportedDbWhiteboardDialog title={"RubyOnRails 💎"} data={result} />

			<DatabaseWhiteboard
				initialNodes={initialNodes}
				initialEdges={initialEdges}
			/>
		</>
	);
}
