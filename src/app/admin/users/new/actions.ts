"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function createUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!username || !password || !role) {
    return { message: "Tüm alanları doldurun." };
  }

  // Şifre karmaşıklık kontrolü
  if (password.length < 8) {
    return { message: "Şifre en az 8 karakter olmalıdır." };
  }
  if (!/[A-Z]/.test(password)) {
    return { message: "Şifre en az bir büyük harf içermelidir." };
  }
  if (!/[a-z]/.test(password)) {
    return { message: "Şifre en az bir küçük harf içermelidir." };
  }
  if (!/[0-9]/.test(password)) {
    return { message: "Şifre en az bir rakam içermelidir." };
  }

  try {
    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') { // Prisma'dan gelen unique constraint hatası
      return { message: `"${username}" kullanıcı adı zaten alınmış.` };
    }
    return { message: "Kullanıcı oluşturulurken bir hata oluştu." };
  }
  
  // Başarılı olduğunda cache'i temizle ve yönlendir.
  revalidatePath("/admin/users");
  redirect("/admin/users");
} 