import { NextAuthOptions } from "next-auth"
import CredentialProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs";
import { DefaultUser, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    phone_number: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      phone_number: string;
    } & DefaultSession["user"]
  }
}
export const authConfig: NextAuthOptions = {
    providers: [
        CredentialProvider({
            credentials: {
                phone_number: {
                    type: "text",
                    label: "Phone Number",
                    placeholder: "0123456789",
                    required: true
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "**********",
                    required: true
                }
            },
            authorize: async (credentials: any) => {

                if (!credentials?.phone_number || !credentials?.password) {
                    return null;
                }

                const worker = await prisma.worker.findUnique({
                    where: {
                        phone_number: credentials?.phone_number,
                    }
                })

                if (!worker) {
                    return null;
                }

                const isValid = await compare(credentials.password, worker.passwordHash)

                if (!isValid) {
                    return null;
                }

                return {
                    id: worker.id.toString(),
                    name: worker.name,
                    email: worker.email,
                    phone_number: worker.phone_number,
                    role: worker.worker_type,
                };
            }
        } as any)
    ],

    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.phone_number = user.phone_number;
                token.email = user.email;
            }

            return token;
        },
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.id as string,
                name: token.name as string,
                email: token.email as string,
                phone_number: token.phone_number as string,
                role: token.role as string,
            };
            return session;
        },

    }
}
