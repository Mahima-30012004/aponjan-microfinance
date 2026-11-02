"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  );
}