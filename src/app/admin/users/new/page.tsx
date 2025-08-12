import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/authOptions";
import { NewUserForm } from "./NewUserForm";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-bold">Yetkisiz erişim.</p>
        <p>Bu sayfayı görüntülemek için admin yetkisine sahip olmalısınız.</p>
      </div>
    );
  }

  return <NewUserForm />;
} 