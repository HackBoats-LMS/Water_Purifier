import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request:NextRequest){
    try{
        const {name,phone_number,password} = await request.json();

        if(!phone_number || !password){
            return NextResponse.json({error:"Phone number and password are required"}, {status:400});
        }
         const isNotNew = await prisma.worker.findUnique({
            where:{
                phone_number:phone_number
            }
         })
         
         if(isNotNew){
            return NextResponse.json({error:"Phone number already exists"}, {status:400});
         }

         const hashedPassword = await bcrypt.hash(password,10);

         const worker = await prisma.worker.create({
            data:{
                name:name,
                phone_number:phone_number,
                passwordHash:hashedPassword,
            }
         })

         return NextResponse.json({data:"Worker created successfully"}, {status:200});

    }catch(e){
        console.log(e);
        return NextResponse.json({error:"Internal Server Error"}, {status:500});
    }
}
