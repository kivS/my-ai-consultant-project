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
	useStoreApi,
	useReactFlow,
} from "@xyflow/react";

import * as d3 from "d3-force";
// you also need to adjust the style import
// import "@xyflow/react/dist/style.css";

// or if you just want basic styles
import "@xyflow/react/dist/base.css";

import { IconKey, IconSpline } from "./ui/icons";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function DatabaseWhiteboard({ initialNodes, initialEdges }) {
	const nodeTypes = useMemo(() => ({ dbTableNode: DbTableNode }), []);

	const { theme, resolvedTheme } = useTheme();

	let positionedNodes = null;
	try {
		positionedNodes = positionNodesConsideringRelations(initialNodes);
	} catch (error) {
		console.error("Failed to position nodes: ", error);
		positionedNodes = initialNodes;
	}

	const [nodes, setNodes, onNodesChange] = useNodesState(positionedNodes);

	// const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	return (
		<div className="w-[800px] h-[400px] border p-2 rounded bg-orange-300 dark:bg-transparent">
			<ReactFlow
				colorMode="system"
				nodes={nodes}
				minZoom={0.1}
				edges={initialEdges}
				onNodesChange={onNodesChange}
				// onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				proOptions={{
					hideAttribution: true,
				}}
				fitView
				fitViewOptions={{ padding: 0.2 }}
			>
				<Controls />
				{/* <MiniMap /> */}

				{resolvedTheme === "light" ? (
					<Background bgColor="#fdba74" variant="dots" gap={12} size={1} />
				) : (
					<Background variant="dots" gap={12} size={1} />
				)}
			</ReactFlow>
		</div>
	);
}

function DbTableNode({ data }) {
	const store = useStoreApi();
	const { zoomIn, zoomOut, setCenter } = useReactFlow();
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
										<Tooltip delayDuration={0}>
											<TooltipTrigger>
												<IconSpline />
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-center">Foreign key</p>
												<p className="">
													<Button
														variant="link"
														data-to_table={col.foreign_key_table}
														className="text-cyan-200"
														onClick={(e) => {
															console.log(e.target);
															const to_table = e.target.dataset.to_table;
															const { nodeLookup } = store.getState();

															const targetNode = nodeLookup.get(to_table);

															const x =
																targetNode.position.x +
																targetNode.measured.width / 2;
															const y =
																targetNode.position.y +
																targetNode.measured.height / 2;
															const zoom = 1.05;

															setCenter(x, y, { zoom, duration: 800 });
														}}
													>
														{col.foreign_key_table} &gt; {col.foreign_key_field}
													</Button>
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

function positionNodesConsideringRelations(initialNodes) {
	const links = initialNodes.flatMap((node) =>
		node.data.columns
			.filter((col) => col.is_foreign_key)
			.map((col) => ({
				source: node.id,
				target: col.foreign_key_table,
				value: 1,
			})),
	);

	const simulation = d3
		.forceSimulation(initialNodes)
		.force(
			"link",
			d3
				.forceLink(links)
				.id((d) => d.id)
				.distance(550),
		)
		.force("charge", d3.forceManyBody().strength(-2000))
		.force("center", d3.forceCenter(800, 400))
		.force("collision", d3.forceCollide().radius(150))
		.stop();

	// Run the simulation synchronously
	for (let i = 0; i < 100; ++i) simulation.tick();

	// Update node positions
	return initialNodes.map((node) => ({
		...node,
		position: { x: node.x, y: node.y },
	}));
}
