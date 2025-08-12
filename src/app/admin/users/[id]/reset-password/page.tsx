import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { hashPassword } from "@/lib/auth";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return <div className="p-8 text-center text-red-600 font-bold">Yetkisiz erişim</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    notFound();
  }

  async function resetPassword(formData: FormData) {
    "use server";
    
    const password = formData.get("password") as string;

    if (!password) {
      throw new Error("Şifre alanı boş bırakılamaz");
    }

    // Şifre karmaşıklık kontrolü
    if (password.length < 8) {
      throw new Error("Şifre en az 8 karakter olmalıdır");
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error("Şifre en az bir büyük harf içermelidir");
    }

    if (!/[a-z]/.test(password)) {
      throw new Error("Şifre en az bir küçük harf içermelidir");
    }

    if (!/[0-9]/.test(password)) {
      throw new Error("Şifre en az bir rakam içermelidir");
    }

    // Şifreyi hash'le
    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: params.id },
      data: {
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/users");
    redirect("/admin/users");
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Şifre Sıfırla</h1>
      <p className="mb-6 text-gray-600">
        {user.username} kullanıcısı için yeni şifre belirleyin
      </p>
      <form action={resetPassword} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Yeni Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <a
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </a>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Şifreyi Sıfırla
          </button>
        </div>
      </form>
    </div>
  );
} 