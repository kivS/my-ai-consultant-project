import DatabaseWhiteboard from "@/components/database-whiteboard";
import { redirect } from "next/navigation";



export default function Test(){

    if (process.env.NODE_ENV !== 'development') {
       redirect('/')
    }

    const initialNodes = [
        { id: 'db_1', position: { x: 0, y: 0 }, data: { label: 'database 1' } },
        { id: 'db_2', position: { x: 0, y: 100 }, data: { label: 'database 2' } },
        { id: 'db_3', position: { x: 0, y: 200 }, data: { label: 'database 2' } },
    ];
    const initialEdges = [{ id: 'e1-2', source: 'db_1', target: 'db_2' }];
    return (
       <div className="flex m-8">
            <DatabaseWhiteboard initialNodes={initialNodes} initialEdges={initialEdges} />
       </div>
    )
}