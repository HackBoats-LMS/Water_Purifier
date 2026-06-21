import { NextRequest,NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


export async function POST(request:NextRequest){
    try {
        const {name,phone_number,password} = await request.json()
        if(!name || !phone_number || !password){
            return NextResponse.json({error:"Please provide All Data"}, {status:400})
        }

        const isNotNew = await prisma.worker.findUnique({
            where:{
                phone_number:phone_number
            }
        })

        if(isNotNew){
            return NextResponse.json({error:"Phone number already exists"}, {status:400})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const worker = await prisma.worker.create({
            data:{
                name:name,
                phone_number:phone_number,
                passwordHash:hashedPassword,
                worker_type:"ADMIN"
            }
        })

        return NextResponse.json({message:"Admin added successfully"}, {status:200})


        
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal server error"}, {status:500})
    }
}