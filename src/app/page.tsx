import { redirect } from "next/navigation";

export default function Home() {
  // Automatically send users to the login page when they visit the main URL
  redirect("/login");
}
