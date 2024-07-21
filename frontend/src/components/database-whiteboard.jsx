"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import React, { useMemo } from "react";

import {
	ReactFlow,
	Background,
	useNodesState,
	useEdgesState,
	Controls,
	MiniMap,
} from "@xyflow/react";

// you also need to adjust the style import
// import "@xyflow/react/dist/style.css";

// or if you just want basic styles
import "@xyflow/react/dist/base.css";

import { IconKey, IconSpline } from "./ui/icons";

export default function DatabaseWhiteboard({ initialNodes, initialEdges }) {
	const nodeTypes = useMemo(() => ({ dbTableNode: DbTableNode }), []);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	// const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	console.log({ initialNodes });

	return (
		<div className="w-[800px] h-[400px] border p-2 rounded ">
			<ReactFlow
				colorMode="system"
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
						<div className="font-medium">
							<div className="flex gap-3">
								{col.is_primary_key ? (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<IconKey />
											</TooltipTrigger>
											<TooltipContent>
												<p>Primary key</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : null}

								{col.is_foreign_key ? (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<IconSpline />
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-center">Foreign key</p>
												<p className="">
													{col.foreign_key_table} &gt; {col.foreign_key_field}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								) : null}

								<div>{col.name}</div>
							</div>
						</div>
						<div className="text-muted-foreground">{col.type}</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
