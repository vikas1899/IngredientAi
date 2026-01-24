import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Camera,
  History,
  Heart,
  Home,
  LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analyze", label: "Analyze", icon: Camera },
    { path: "/history", label: "History", icon: History },
    { path: "/medical-history", label: "Medical Info", icon: Heart },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IngredientAI
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Smart Analysis
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? "text-blue-600 bg-blue-50 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{label}</span>
                {isActive(path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10" />
                )}
              </Link>
            ))}

            <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {(user?.first_name || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.first_name || user?.username}
                  </span>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-sm transition-all duration-200 group"
              >
                <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="relative inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute h-6 w-6 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "rotate-180 opacity-0"
                      : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`absolute h-6 w-6 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "rotate-0 opacity-100"
                      : "-rotate-180 opacity-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-100">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive(path)
                  ? "text-blue-600 bg-blue-50 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive(path) ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <span>{label}</span>
            </Link>
          ))}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="px-4 py-3 mb-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {(user?.first_name || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="text-base font-semibold text-gray-900">
                    {user?.first_name || user?.username}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
