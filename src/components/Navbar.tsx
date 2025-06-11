"use client";

import { useAddMedicineModal, useAddPurchaseModal } from "@/lib/modalStore";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, Menu, Pill, PlusCircle, ShieldPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const { user } = useUser();
  const isAdmin = user?.username === "abhay";
  const { open: openAddMedicine } = useAddMedicineModal();
  const { open: openAddPurchase } = useAddPurchaseModal();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <Link
        href="/"
        onClick={closeMenu}
        className="flex items-center gap-2 hover:text-green-700"
      >
        <Home size={18} /> Home
      </Link>
      <button
        onClick={openAddPurchase}
        className="flex cursor-pointer items-center gap-2 hover:text-green-700"
      >
        <PlusCircle size={18} /> Add Purchase
      </button>
      <Link
        href="/medicines"
        onClick={closeMenu}
        className="flex items-center gap-2 hover:text-green-700"
      >
        <Pill size={18} /> All Medicines
      </Link>
      {isAdmin && (
        <button
          onClick={openAddMedicine}
          className="flex cursor-pointer items-center gap-2 hover:text-green-700"
        >
          <ShieldPlus size={18} /> Add Data
        </button>
      )}
    </>
  );

  return (
    <nav className="w-full border-b border-gray-200 bg-teal-50/60 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex cursor-pointer flex-col">
          <span className="text-2xl font-bold text-green-700">
            Jeevan Jyoti
          </span>
          <span className="-mt-1 text-sm text-gray-600">Medical Store</span>
        </Link>
        <div className="hidden gap-6 text-sm text-gray-700 md:flex md:text-base">
          {navLinks}
        </div>
        <div className="hidden md:block">
          <UserButton afterSignOutUrl="/" />
        </div>
        <button
          className="cursor-pointer p-2 md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 transform bg-teal-50 shadow-lg transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <span className="text-lg font-semibold text-green-700">Menu</span>
          <button
            className="cursor-pointer"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 text-gray-700">
          {navLinks}
          <div className="border-t pt-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}
    </nav>
  );
};

export default Navbar;
