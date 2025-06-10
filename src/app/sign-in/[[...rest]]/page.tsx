"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-green-700">
          Welcome to Jeevan Jyoti
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
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
