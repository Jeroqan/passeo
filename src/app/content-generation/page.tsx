import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";

export default async function ContentGenerationPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  
  // Ana sayfa direkt product-info'ya yönlendir
  redirect("/content-generation/product-info");
} 