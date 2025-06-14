"use client";

import { useMedicineStore } from "@/lib/stores/medicineStore";
import { SignedIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar";

const allowedUsernames = ["abhay", "prince"];

export default function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && allowedUsernames.includes(user.username || "")) {
      useMedicineStore.getState().fetchAllMedicines();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in");
      } else if (!allowedUsernames.includes(user.username || "")) {
        router.push("/unauthorized");
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="px-4 py-6">
      <SignedIn>
        <Navbar />
      </SignedIn>
      {children}
    </main>
  );
}
