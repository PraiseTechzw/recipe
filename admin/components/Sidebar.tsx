import { signOut } from "@/app/actions";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-orange-500">Recipe Admin</h1>
      </div>
      <nav className="space-y-2 flex-1">
        <Link
          href="/"
          className="block p-3 hover:bg-gray-800 rounded transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/users"
          className="block p-3 hover:bg-gray-800 rounded transition-colors"
        >
          Users
        </Link>
        <Link
          href="/recipes"
          className="block p-3 hover:bg-gray-800 rounded transition-colors"
        >
          Recipes
        </Link>
      </nav>
      <div className="border-t border-gray-800 pt-4 px-2 space-y-4">
        <form action={signOut}>
          <button className="w-full text-left p-2 hover:bg-gray-800 rounded text-red-400 transition-colors">
            Sign Out
          </button>
        </form>
        <p className="text-sm text-gray-500">v1.0.0</p>
      </div>
    </aside>
  );
}
