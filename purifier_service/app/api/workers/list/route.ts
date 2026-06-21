import { NextRequest,NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";




export async function GET(request:NextRequest){
    try {
        const session = await getServerSession(authConfig);

        if(session?.user?.role!=="ADMIN" && session?.user?.role!=="WORKER"){
            return NextResponse.json({error:"Unauthorized"}, {status:401})
        }

        const workers = await prisma.worker.findMany({
            where:{
                worker_type:"WORKER"
            }
        })
        return NextResponse.json(workers)
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status:500})
    }
}