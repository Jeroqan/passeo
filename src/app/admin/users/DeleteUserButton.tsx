"use client";

interface DeleteUserButtonProps {
  userId: string;
  deleteUser: (userId: string) => void;
}

export default function DeleteUserButton({ userId, deleteUser }: DeleteUserButtonProps) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      deleteUser(userId);
    }
  };

  return (
    <form onSubmit={handleDelete} className="inline">
      <button
        type="submit"
        className="text-red-600 hover:underline"
      >
        Sil
      </button>
    </form>
  );
} 