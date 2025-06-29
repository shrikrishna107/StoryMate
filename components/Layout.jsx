// components/Layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Clock, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';

const menu = [
  { name: 'New Story', icon: Home, color: 'text-indigo-600', href: '/new-story' },
  { name: 'Pending Stories', icon: Clock, color: 'text-yellow-500', href: '/pending' },
  { name: 'Completed Stories', icon: CheckCircle2, color: 'text-green-500', href: '/completed' },
  { name: 'Memory Loss', icon: AlertTriangle, color: 'text-red-500', href: '/memory-loss' },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#f8f7ff]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)] border-r border-gray-200 z-20 flex flex-col">
        {/* Sidebar Header */}
        <div className="h-20 px-6 flex items-center border-b border-gray-200">
          <div className="h-8 w-8 bg-indigo-600 rounded" />
          <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            StoryMate
          </h1>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menu.map(({ name, icon: Icon, color, href }) => (
            <Link
              key={name}
              href={href}
              className={`flex items-center h-12 px-4 rounded-lg text-base font-medium text-gray-700 hover:bg-indigo-50 transition-colors ${color}`}
            >
              <Icon className={`w-5 h-5 mr-3 ${color}`} />
              {name}
            </Link>
          ))}
        </nav>
        {/* Logout */}
        <div className="px-4 border-t border-gray-200 pt-4">
          <button className="flex items-center w-full h-12 px-4 rounded-lg text-red-500 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-[#f8f7ff] border-l border-gray-100 px-6 py-8 transition-all">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
