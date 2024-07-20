"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React, { useMemo } from "react";
import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";

export default function DatabaseWhiteboard({ initialNodes, initialEdges }) {
	const nodeTypes = useMemo(() => ({ dbTableNode: DbTableNode }), []);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	// const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	console.log({ initialNodes });

	return (
		<div className="w-[800px] h-[400px] border p-2 rounded bg-orange-300 text-black">
			<ReactFlow
				nodes={nodes}
				edges={initialEdges}
				onNodesChange={onNodesChange}
				// onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				proOptions={{
					hideAttribution: true,
				}}
			>
				{/* <Controls /> */}
				{/* <MiniMap /> */}
				<Background variant="dots" gap={12} size={1} />
			</ReactFlow>
		</div>
	);
}

function DbTableNode({ data }) {
	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle className="text-center">{data.name}</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4 border-y py-4">
				{data?.columns?.map((col) => (
					<div
						key={col.id}
						className="grid grid-cols-[minmax(100px,1fr)_minmax(100px,1fr)] items-center gap-4"
					>
						<div className="font-medium">{col.name}</div>
						<div className="text-muted-foreground">{col.type}</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
