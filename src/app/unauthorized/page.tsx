export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-600">
        You are not authorized to access this page.
      </p>
    </div>
  );
}
