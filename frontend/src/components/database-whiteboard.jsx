'use client'


import React from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
} from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes = [
    { id: 'db_1', position: { x: 0, y: 0 }, data: { label: 'database 1' } },
    { id: 'db_2', position: { x: 0, y: 100 }, data: { label: 'database 2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


export default function DatabaseWhiteboard(){
    return (
        <div className="w-[800px] h-[400px] border p-2 rounded bg-orange-300 text-black">
            <ReactFlow nodes={initialNodes} edges={initialEdges}> 
                <Controls />
                {/* <MiniMap /> */}
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
        
    )
}