import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401 });
  }
  const { username, password, role } = await req.json();
  if (!username || !password || !role) {
    return new Response(JSON.stringify({ error: "Eksik bilgi" }), { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return new Response(JSON.stringify({ error: "Kullanıcı adı zaten var" }), { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, password: hashed, role } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
} 