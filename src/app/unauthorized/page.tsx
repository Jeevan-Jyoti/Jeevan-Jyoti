export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="text-gray-600">
        You are not authorized to access this page.
      </p>
    </div>
  );
}
