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
} from "lucide-react";

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
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
      {/* Overlay for small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        style={{
          width: isSidebarOpen ? "16rem" : "5rem", // 64 = 16rem, 20 = 5rem
          transition: "width 0.3s ease",
        }}
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          overflow-hidden
          z-30
          transition-transform duration-300 ease-in-out
          `}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Collapse / Close button */}
          <button
            onClick={toggleSidebar}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {isSidebarOpen && (
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Menu
            </span>
          )}
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
                      onClick={closeSidebar} // Close sidebar on link click on mobile
                      className={`flex items-center p-4 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600"
                          : ""
                      }`}
                      style={{
                        justifyContent: isSidebarOpen ? "flex-start" : "center",
                      }}
                    >
                      <span className="mr-3 flex-shrink-0">{link.icon}</span>
                      {isSidebarOpen && link.name}
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
