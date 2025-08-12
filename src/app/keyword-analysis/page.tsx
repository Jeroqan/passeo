import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import KeywordAnalysisClient from "./KeywordAnalysisClient";

export default async function KeywordAnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return <KeywordAnalysisClient />;
} 