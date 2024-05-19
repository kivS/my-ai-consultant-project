"use client";

import DatabaseWhiteboard from "@/components/database-whiteboard";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";

import "reactflow/dist/style.css";

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
	return (
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
