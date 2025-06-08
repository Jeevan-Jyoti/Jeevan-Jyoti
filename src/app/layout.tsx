import AddMedicineModal from "@/components/AddMedicineModal";
import AddPurchaseModal from "@/components/AddPurchaseModal";
import ProtectedPage from "@/components/ProtectedPage";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeevan Jyoti",
  description: "A Medical Store Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ProtectedPage>
            <AddMedicineModal />
            <AddPurchaseModal />
            <Toaster richColors position="top-center" />
            {children}
          </ProtectedPage>
        </ClerkProvider>
      </body>
    </html>
  );
}
