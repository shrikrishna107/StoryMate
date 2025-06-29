// components/Sidebar.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useAuthContext } from './AuthProvider';
import Modal from './Modal';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { BookPlus, History, CheckSquare, Trash2, LogOut, Loader2 } from 'lucide-react';

interface SidebarProps {
  user: User;
  children?: React.ReactNode;
}

const Sidebar = ({ user, children }: SidebarProps) => {
  const router = useRouter();
  const { auth, db } = useAuthContext();

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMemoryLossModalOpen, setMemoryLossModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const navItems = [
    { href: '/new-story', label: 'Start a New Story! Mate', icon: BookPlus, color: 'text-indigo-600' },
    { href: '/pending', label: 'Pending Stories', icon: History, color: 'text-yellow-500' },
    { href: '/completed', label: 'Completed Stories', icon: CheckSquare, color: 'text-green-500' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    setLogoutModalOpen(false);
    router.push('/');
  };

  const handleMemoryLoss = async () => {
    if (!user) return;
    setIsClearing(true);
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("No stories to delete.");
      } else {
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        alert("All your stories have been permanently deleted.");
      }
    } catch (error) {
      console.error("Error during memory loss:", error);
      alert("An error occurred while deleting your stories. Please try again.");
    } finally {
      setIsClearing(false);
      setMemoryLossModalOpen(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f7ff]">
      {/* Animated gradient for logo text */}
      <style jsx global>{`
        .sidebar-gradient-text {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef, #6366f1);
          background-size: 200% 200%;
          animation: sidebar-gradient-move 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        @keyframes sidebar-gradient-move {
          0% { background-position: 0% 50%;}
          100% { background-position: 100% 50%;}
        }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)] border-r border-gray-200 z-20 flex flex-col">
        {/* Header with Logo */}
        <div className="h-20 px-6 flex items-center border-b border-gray-200 flex-shrink-0">
          <Link
            href="/dashboard"
            className="text-2xl font-bold sidebar-gradient-text transition-transform duration-200 hover:scale-105"
          >
            StoryMate
          </Link>
        </div>
        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`
                flex items-center mt-5 h-12 px-4 rounded-lg border border-transparent
                transition-all duration-200 text-base font-medium
                shadow-sm
                ${router.pathname === item.href
                  ? 'bg-indigo-100 text-indigo-600 border-indigo-200'
                  : 'text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md'
                }
                hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400
                active:scale-95
              `}
              style={{ marginBottom: '4px' }}
            >
              <item.icon size={20} className={`${item.color} mr-3 flex-shrink-0`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* Footer Actions Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
          <button
            onClick={() => setMemoryLossModalOpen(true)}
            className={`
              flex items-center w-full h-12 px-4 rounded-lg border border-red-200
              text-red-600 bg-white font-medium
              hover:bg-red-50 hover:border-red-400 hover:shadow-md
              hover:scale-[1.03] active:scale-95
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-300
              mb-2
            `}
          >
            <Trash2 size={20} className="mr-3" />
            <span>Memory Loss</span>
          </button>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className={`
              flex items-center w-full h-12 px-4 rounded-lg border border-red-200
              text-red-600 bg-white font-medium
              hover:bg-red-50 hover:border-red-400 hover:shadow-md
              hover:scale-[1.03] active:scale-95
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-300
            `}
          >
            <LogOut size={20} className="mr-3" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-[#f8f7ff] border-l border-gray-100 px-4 md:px-8 py-8 transition-all">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
      {/* --- Modals --- */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)}>
        <h3 className="text-xl font-bold text-gray-800">Log Out</h3>
        <p className="my-4 text-gray-600">Are you sure you wanna leave???</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setLogoutModalOpen(false)}
            className={`
              px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700
              hover:bg-gray-100 hover:border-gray-400 hover:shadow
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              mr-2
            `}
          >
            No
          </button>
          <button
            onClick={handleLogout}
            className={`
              px-4 py-2 rounded-lg border border-red-500 bg-red-500 text-white font-semibold
              hover:bg-red-600 hover:border-red-600 hover:shadow
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-400
            `}
          >
            Yes
          </button>
        </div>
      </Modal>
      <Modal isOpen={isMemoryLossModalOpen} onClose={() => setMemoryLossModalOpen(false)}>
        <h3 className="text-xl font-bold text-gray-800">Initiate Memory Loss?</h3>
        <p className="my-4 text-gray-600">
          This will permanently delete ALL your pending and completed stories. This action cannot be undone. Are you sure?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            disabled={isClearing}
            onClick={() => setMemoryLossModalOpen(false)}
            className={`
              px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700
              hover:bg-gray-100 hover:border-gray-400 hover:shadow
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              mr-2
              disabled:opacity-60
            `}
          >
            Cancel
          </button>
          <button
            disabled={isClearing}
            onClick={handleMemoryLoss}
            className={`
              px-4 py-2 rounded-lg border border-red-500 bg-red-500 text-white font-semibold flex items-center
              hover:bg-red-600 hover:border-red-600 hover:shadow
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-400
              disabled:bg-red-300 disabled:border-red-300 disabled:cursor-not-allowed
            `}
          >
            {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isClearing ? 'Deleting...' : 'Yes, Delete Everything'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Sidebar;
