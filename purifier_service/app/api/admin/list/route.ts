import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request:NextRequest){
    try {
        const admins = await prisma.worker.findMany({
            where:{
                worker_type:"ADMIN"
            }
        })
        return NextResponse.json(admins)
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status:500})
    }

}