import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Welcome to My App</h1>
      <p className="text-lg text-gray-600">This is the home page.</p>

      <Link href="/Chat">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          Go to the chat!
        </button>
      </Link>
    </main>
  );
}
