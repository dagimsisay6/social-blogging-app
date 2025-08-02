// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SideBarContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Files,
  Plus,
  StickyNote,
  X,
  Menu,
} from "lucide-react"; // Imported Lucide icons

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-6 w-6" />,
      authRequired: true,
    },
    {
      name: "All Posts",
      path: "/posts",
      icon: <Files className="h-6 w-6" />,
      authRequired: false,
    },
    {
      name: "Create Post",
      path: "/create-post",
      icon: <Plus className="h-6 w-6" />,
      authRequired: true,
    },
    {
      name: "My Posts",
      path: "/my-posts",
      icon: <StickyNote className="h-6 w-6" />,
      authRequired: true,
    },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-30
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none lg:w-auto lg:h-auto`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end items-center">
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5">
          <ul>
            {sidebarLinks.map((link) => {
              if (!link.authRequired || isAuthenticated) {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={closeSidebar}
                      className={`flex items-center p-4 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 ${isActive
                          ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600"
                          : ""
                        }`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
