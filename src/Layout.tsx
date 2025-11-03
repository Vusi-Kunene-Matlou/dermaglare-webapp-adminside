// src/Layout.tsx

import React from "react";
import { motion } from "framer-motion";

// Define the types for the props
interface Page {
  name: string;
  icon: string;
}

// This is the interface that needs to be updated
interface LayoutProps {
  pages: Page[];
  currentPage: string;
  setCurrentPage: (page: any) => void;
  handleLogout: () => void;
  userEmail: string | null | undefined;
  children: React.ReactNode;
  theme: "light" | "dark"; // This is the line that was missing
}

export const Layout: React.FC<LayoutProps> = ({
  pages,
  currentPage,
  setCurrentPage,
  handleLogout,
  userEmail,
  children,
  theme, // Now the component can receive the theme prop
}) => {
  // Dynamically set CSS classes based on the current theme
  const isDark = theme === "dark";
  const layoutClasses = isDark
    ? "bg-gray-800 text-white"
    : "bg-gray-100 text-gray-800";
  const sidebarClasses = isDark
    ? "bg-brand-teal"
    : "bg-white border-r border-gray-200";
  const logoClasses = isDark ? "text-brand-yellow" : "text-brand-gold";
  const navButtonClasses = (isActive: boolean) => {
    if (isActive) {
      return isDark
        ? "bg-brand-yellow text-gray-900 font-bold shadow-lg"
        : "bg-brand-gold text-white shadow-md";
    }
    return isDark
      ? "text-white/70 hover:bg-white/10 hover:text-white"
      : "text-gray-500 hover:bg-gray-200 hover:text-gray-900";
  };
  const userInfoClasses = isDark ? "text-white/60" : "text-gray-500";
  const mainContentClasses = isDark ? "bg-gray-900" : "bg-gray-100";

  return (
    <div
      className={`flex h-screen font-sans transition-colors duration-300 ${layoutClasses}`}
    >
      {/* --- SIDEBAR --- */}
      <aside
        className={`w-64 flex-shrink-0 flex flex-col transition-colors duration-300 ${sidebarClasses}`}
      >
        <div
          className={`h-20 flex items-center px-6 ${
            isDark ? "border-b border-white/10" : ""
          }`}
        >
          <h1 className={`text-xl font-bold tracking-wider ${logoClasses}`}>
            Admin Portal
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {pages.map((page) => (
            <button
              key={page.name}
              onClick={() => setCurrentPage(page.name)}
              className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 ${navButtonClasses(
                currentPage === page.name
              )}`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={page.icon}
                />
              </svg>
              <span>{page.name}</span>
            </button>
          ))}
        </nav>
        <div
          className={`px-4 py-4 ${
            isDark ? "border-t border-white/10" : "border-t border-gray-200"
          }`}
        >
          <div className="mb-4">
            <p className={`text-sm ${userInfoClasses}`}>Signed in as</p>
            <p className="text-md font-semibold truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main
        className={`flex-1 overflow-y-auto p-8 transition-colors duration-300 ${mainContentClasses}`}
      >
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
