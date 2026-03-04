export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page Works!</h1>
        <p className="text-gray-600">DEV_SKIP_AUTH = {process.env.NEXT_PUBLIC_DEV_SKIP_AUTH}</p>
        <p className="text-gray-600">ENABLE_MOCKS = {process.env.NEXT_PUBLIC_ENABLE_MOCKS}</p>
      </div>
    </div>
  );
}
