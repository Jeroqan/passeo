import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Yetkisiz" }), { status: 401 });
  }
  const { oldPassword, newPassword } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return new Response(JSON.stringify({ error: "Kullanıcı bulunamadı" }), { status: 404 });
  }
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    return new Response(JSON.stringify({ error: "Eski şifre yanlış" }), { status: 400 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
} 