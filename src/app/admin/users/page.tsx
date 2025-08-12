import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteUserButton from "./DeleteUserButton";

async function deleteUser(userId: string) {
  "use server";
  
  await prisma.user.delete({
    where: { id: userId },
  });
  
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  if (!session?.user || session.user.role !== "admin") {
    return <div className="p-8 text-center text-red-600 font-bold">Yetkisiz erişim</div>;
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      <Link href="/admin/users/new" className="mb-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Yeni Kullanıcı Ekle</Link>
      <table className="w-full bg-white rounded shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Kullanıcı Adı</th>
            <th className="py-2 px-4 text-left">Rol</th>
            <th className="py-2 px-4 text-left">Oluşturulma</th>
            <th className="py-2 px-4">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: { id: string; username: string; role: string; createdAt: Date }) => (
            <tr key={user.id} className="border-t">
              <td className="py-2 px-4">{user.username}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">{new Date(user.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4 text-center">
                <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:underline mr-2">Düzenle</Link>
                <Link href={`/admin/users/${user.id}/reset-password`} className="text-blue-600 hover:underline mr-2">Şifre Sıfırla</Link>
                <DeleteUserButton userId={user.id} deleteUser={deleteUser} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 