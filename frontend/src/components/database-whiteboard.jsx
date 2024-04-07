'use client'


import React from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
} from 'reactflow';

import 'reactflow/dist/style.css';




export default function DatabaseWhiteboard({ initialNodes ,initialEdges }){
    return (
        <div className="w-[800px] h-[400px] border p-2 rounded bg-orange-300 text-black">
            <ReactFlow nodes={initialNodes} edges={initialEdges}> 
                {/* <Controls /> */}
                {/* <MiniMap /> */}
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
        
    )
}