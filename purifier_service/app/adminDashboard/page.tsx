import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation"
import WorkersPage from "./WorkerPage";

export default async function Page() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <WorkersPage />;
}