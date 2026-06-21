import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import AssignmentsPage from "./AssignmentsPage";

export default async function Page() {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <AssignmentsPage />;
}
