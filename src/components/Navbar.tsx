"use client";

import { useAddMedicineModal } from "@/lib/modalStore";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, Menu, Pill, PlusCircle, ShieldPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const { user } = useUser();
  const isAdmin = user?.username === "abhay";
  const { open } = useAddMedicineModal();

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
      <Link
        href="/add-purchase"
        onClick={closeMenu}
        className="flex items-center gap-2 hover:text-green-700"
      >
        <PlusCircle size={18} /> Add Purchase
      </Link>
      <Link
        href="/medicines"
        onClick={closeMenu}
        className="flex items-center gap-2 hover:text-green-700"
      >
        <Pill size={18} /> All Medicines
      </Link>
      {isAdmin && (
        <button
          onClick={open}
          className="flex items-center gap-2 hover:text-green-700 cursor-pointer"
        >
          <ShieldPlus size={18} /> Add Data
        </button>
      )}
    </>
  );

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-700">
            Jeevan Jyoti
          </span>
          <span className="text-sm text-gray-600 -mt-1">Medical Store</span>
        </div>
        <div className="hidden md:flex gap-6 text-gray-700 text-sm md:text-base">
          {navLinks}
        </div>
        <div className="hidden md:block">
          <UserButton afterSignOutUrl="/" />
        </div>
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="text-lg font-semibold text-green-700">Menu</span>
          <button onClick={closeMenu} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 text-gray-700">
          {navLinks}
          <div className="pt-2 border-t">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}
    </nav>
  );
};

export default Navbar;
