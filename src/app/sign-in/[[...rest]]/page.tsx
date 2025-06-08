"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-4">
          Welcome to Jeevan Jyoti
        </h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Please sign in to access the medical store dashboard
        </p>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-green-600 hover:bg-green-700 text-sm",
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
