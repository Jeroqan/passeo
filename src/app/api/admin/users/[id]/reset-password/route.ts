import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401 });
  }
  const { newPassword } = await req.json();
  if (!newPassword) {
    return new Response(JSON.stringify({ error: "Eksik bilgi" }), { status: 400 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: params.id }, data: { password: hashed } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
} 