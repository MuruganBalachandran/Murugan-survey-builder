import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CustomModal } from "@/components/common/CustomModal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";
import { NAVIGATION_LINKS } from "@/utils/constants";
import {
  ChevronDownIcon,
  HomeIcon,
  LogoutIcon,
  NavSurveyIcon,
} from "@/utils/icons";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userInitial = user?.name?.[0]?.toUpperCase() || "?";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsModalLoading(true);
    try {
      await dispatch(logoutUser());
      setIsDropdownOpen(false);
      setShowLogoutModal(false);
      await navigate({ to: "/login" });
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => setShowLogoutModal(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = NAVIGATION_LINKS.map((link) => ({
    ...link,
    icon: link.icon === "HomeIcon" ? HomeIcon : NavSurveyIcon,
  }));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex flex-1 items-center gap-3 pl-4 sm:pl-6 lg:pl-8">
            <button
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 shadow-lg shadow-violet-200">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SurveyBuilder</h1>
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path as any })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-md shadow-violet-100"
                      : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <Icon />
                  <span className="text-sm">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex flex-shrink-0 items-center gap-2 pr-4 sm:pr-6 lg:pr-8">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center">
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/login" })}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/signup" })}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-100"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500">
                      <span className="text-white font-semibold text-sm">
                        {userInitial}
                      </span>
                    </div>
                    <ChevronDownIcon />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Account
                        </p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogoutIcon />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
            {/* Nav links */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate({ to: link.path as any })}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    <Icon />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Auth section */}
            <div className="mt-3 border-t border-gray-100 pt-3">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/login" })}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/signup" })}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogoutIcon />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <CustomModal
        isOpen={showLogoutModal}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        variant="danger"
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
        confirmText="Sign Out"
        cancelText="Cancel"
        isLoading={isModalLoading}
      />
    </>
  );
};
