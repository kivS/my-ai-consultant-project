"use client";

import React, { useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";

import "reactflow/dist/style.css";

export default function DatabaseWhiteboard({ initialNodes, initialEdges }) {
	const nodeTypes = useMemo(() => ({ dbTableNode: DbTableNode }), []);

	return (
		<div className="w-[800px] h-[400px] border p-2 rounded bg-orange-300 text-black">
			<ReactFlow
				nodes={initialNodes}
				edges={initialEdges}
				nodeTypes={nodeTypes}
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
		<>
			<div className="border p-2 rounded">
				<div className="m-2 text-cyan-700 font-bold text-2xl ">{data.name}</div>
				<ul>
					{data?.columns.map((col) => (
						<li key={col.id}>{col.name}</li>
					))}
				</ul>
			</div>
		</>
	);
}
