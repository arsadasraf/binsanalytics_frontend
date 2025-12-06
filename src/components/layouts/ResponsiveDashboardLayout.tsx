"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Factory,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Shield,
  Store,
  Users,
  Wallet,
  Home,
  PackageMinus,
  PackagePlus,
  Receipt,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Truck,
  ShoppingCart,
  Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clearSession } from "@/src/lib/session";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  priority?: number;
  subItems?: NavItem[];
};

const storeSubItems: NavItem[] = [
  { href: "/dashboard/store?tab=home", label: "Home", icon: Home },
  { href: "/dashboard/store?tab=material-issue", label: "Material Issue", icon: PackageMinus },
  { href: "/dashboard/store?tab=dc", label: "Bills", icon: Receipt },
  { href: "/dashboard/store?tab=masters", label: "Masters", icon: Database },
];

const ppcSubItems: NavItem[] = [
  { href: "/dashboard/ppc?tab=home", label: "Home", icon: Home },
  { href: "/dashboard/ppc?tab=po-list", label: "PO List", icon: ShoppingCart },
  { href: "/dashboard/ppc?tab=create-po", label: "Create PO", icon: PackagePlus },
  { href: "/dashboard/ppc?tab=create-workorder", label: "Create Work Order", icon: Receipt },
  { href: "/dashboard/ppc?tab=auto-planning", label: "Auto Planning", icon: Database },
];

const companyNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, priority: 1 },
  {
    href: "/dashboard/store",
    label: "Store",
    icon: Store,
    priority: 2,
    subItems: storeSubItems
  },
  {
    href: "/dashboard/ppc",
    label: "PPC",
    icon: Factory,
    priority: 3,
    subItems: ppcSubItems
  },
  { href: "/dashboard/hr", label: "HR", icon: Shield, priority: 4 },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet, priority: 5 },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart, priority: 6 },
  { href: "/dashboard/admin", label: "User Mgmt", icon: Users, priority: 7 },
];

const departmentNavMap: Record<string, NavItem[]> = {
  HR: [{ href: "/dashboard/hr", label: "HR Dashboard", icon: Shield, priority: 1 }],
  Store: [{
    href: "/dashboard/store",
    label: "Store",
    icon: Store,
    priority: 1,
    subItems: storeSubItems
  }],
  PPC: [{
    href: "/dashboard/ppc",
    label: "PPC",
    icon: Factory,
    priority: 1,
    subItems: ppcSubItems
  }],
  Accounts: [{ href: "/dashboard/accounts", label: "Accounts", icon: Wallet, priority: 1 }],
  Reports: [{ href: "/dashboard/reports", label: "Reports", icon: LineChart, priority: 1 }],
};

const fallbackNav: NavItem[] = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, priority: 1 }];

function resolveNavItems(userType: string | null, department: string | null) {
  const list =
    userType === "company"
      ? companyNav
      : department && departmentNavMap[department]
        ? departmentNavMap[department]
        : fallbackNav;

  return [...list].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export default function ResponsiveDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [navItems, setNavItems] = useState<NavItem[]>(fallbackNav);
  const [userName, setUserName] = useState("BinsAnalytics");
  const [userSubtitle, setUserSubtitle] = useState("Dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // New state for desktop toggle
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [ppcMenuOpen, setPpcMenuOpen] = useState(false);

  // Check if we are in the Store or PPC module
  const isStoreModule = pathname?.startsWith("/dashboard/store");
  const isPPCModule = pathname?.startsWith("/dashboard/ppc");

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const userInfoStr = localStorage.getItem("userInfo");
    let department: string | null = null;
    let resolvedName = "BinsAnalytics";
    let resolvedSubtitle = "Dashboard";

    if (userInfoStr) {
      try {
        const parsed = JSON.parse(userInfoStr);
        department = parsed?.department || null;
        resolvedName = parsed?.name || parsed?.companyName || resolvedName;
        resolvedSubtitle = parsed?.department || (userType === "company" ? "Company Admin" : resolvedSubtitle);
      } catch (err) {
        console.warn("Failed to parse user info from storage", err);
      }
    } else if (userType === "company") {
      resolvedSubtitle = "Company Admin";
    }

    setNavItems(resolveNavItems(userType, department));
    setUserName(resolvedName);
    setUserSubtitle(resolvedSubtitle);

    // Auto-expand store menu if in store module
    if (pathname?.startsWith("/dashboard/store")) {
      setStoreMenuOpen(true);
    }
    // Auto-expand PPC menu if in PPC module
    if (pathname?.startsWith("/dashboard/ppc")) {
      setPpcMenuOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // Mobile Bottom Nav Logic
  const mobileBottomNavItems = useMemo(() => {
    if (isStoreModule) {
      // For Store: Home, Material Issue, Bills
      return [
        storeSubItems[0], // Home
        storeSubItems[1], // Material Issue  
        storeSubItems[2], // Bills (parent with sub-items)
      ];
    }
    if (isPPCModule) {
      // For PPC: Home, PO List, Create PO, Create Work Order (First 4)
      return ppcSubItems.slice(0, 4);
    }
    // Default global nav (first 4)
    return navItems.slice(0, 4);
  }, [isStoreModule, isPPCModule, navItems]);

  const mobileOverflowItems = useMemo(() => {
    if (isStoreModule) {
      // Remaining Store items: Masters only
      return [storeSubItems[3]]; // Masters
    }
    if (isPPCModule) {
      // Remaining PPC items
      return ppcSubItems.slice(4);
    }
    return navItems.slice(4);
  }, [isStoreModule, isPPCModule, navItems]);

  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Re-added renderNavLink function
  const renderNavLink = (item: NavItem, isMobile = false, isSubItem = false) => {
    const Icon = item.icon;
    // Check active state
    let isActive = false;
    if (item.href.includes("?")) {
      // For query param links (Store sub-items)
      const itemTab = new URLSearchParams(item.href.split("?")[1]).get("tab");
      const currentTab = searchParams.get("tab") || "home"; // Default to home if no tab
      isActive = pathname === item.href.split("?")[0] && itemTab === currentTab;
    } else {
      // For path links
      isActive = pathname === item.href || (!!pathname && pathname.startsWith(item.href + "/"));
    }

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isStoreExpanded = item.label === "Store" && storeMenuOpen;
    const isPPCExpanded = item.label === "PPC" && ppcMenuOpen;
    const isExpanded = isStoreExpanded || isPPCExpanded;

    if (isMobile) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => {
            setMobileSidebarOpen(false);
            setMobileMoreOpen(false);
          }}
          className={[
            "group flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-indigo-600" : "text-gray-500",
          ].join(" ")}
        >
          <Icon size={24} className={isActive ? "text-indigo-600" : "text-gray-500"} />
          <span className="text-[10px] font-medium mt-1">{item.label}</span>
        </Link>
      );
    }

    // Desktop Sidebar Item
    return (
      <div key={item.label}>
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasSubItems) {
              // If clicking the parent item, toggle expansion
              if (item.label === "Store") {
                setStoreMenuOpen(!storeMenuOpen);
              } else if (item.label === "PPC") {
                setPpcMenuOpen(!ppcMenuOpen);
              }
            }
          }}
          className={[
            "group flex items-center justify-between rounded-xl transition-all",
            isSubItem ? "pl-10 pr-3 py-2 text-sm" : "px-3 py-2 text-sm font-medium",
            isActive && !hasSubItems
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <Icon size={isSubItem ? 16 : 18} className={isActive && !hasSubItems ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-500"} />
            <span className={desktopSidebarOpen ? "" : "hidden"}>{item.label}</span>
          </div>
          {hasSubItems && desktopSidebarOpen && (
            <div onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (item.label === "Store") {
                setStoreMenuOpen(!storeMenuOpen);
              } else if (item.label === "PPC") {
                setPpcMenuOpen(!ppcMenuOpen);
              }
            }}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </Link>
        {/* Render Sub-items */}
        {hasSubItems && isExpanded && desktopSidebarOpen && (
          <div className="mt-1 flex flex-col gap-1">
            {item.subItems!.map(sub => renderNavLink(sub, false, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ease-in-out ${desktopSidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className={`p-6 border-b border-gray-50 ${desktopSidebarOpen ? "" : "flex justify-center p-4"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold">B</span>
            </div>
            {desktopSidebarOpen && <span className="font-bold text-xl text-gray-900">BinsAnalytics</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => renderNavLink(item))}
        </div>

        <div className="p-4 border-t border-gray-50">
          {desktopSidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userSubtitle}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold" title={userName}>
                {userName.charAt(0)}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${desktopSidebarOpen ? "gap-3 px-3" : "justify-center"} py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors`}
            title="Sign Out"
          >
            <LogOut size={18} />
            {desktopSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Collapse Button */}
        <div className="hidden lg:flex items-center px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors mr-3"
            title={desktopSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
          {/* Breadcrumb or Helper */}
          <div className="text-sm font-medium text-gray-500">
            {pathname?.split('/').slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}
          </div>
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold text-lg text-gray-900">BinsAnalytics</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0 z-30 pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            {mobileBottomNavItems.map((item) => (
              <div key={item.href} className="flex-1 h-full">
                {renderNavLink(item, true)}
              </div>
            ))}

            {/* More Button */}
            <div className="flex-1 h-full relative">
              <button
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                className={`flex flex-col items-center justify-center w-full h-full transition-all ${mobileMoreOpen ? "text-indigo-600" : "text-gray-500"
                  }`}
              >
                <MoreVertical size={24} />
                <span className="text-[10px] font-medium mt-1">More</span>
              </button>

              {/* Overflow Menu */}
              {mobileMoreOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2">
                  {mobileOverflowItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50 last:border-0"
                    >
                      <item.icon size={18} className="text-gray-500" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Drawer (for global nav) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <span className="font-bold text-xl text-gray-900">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ChevronDown className="rotate-90" size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
