import Link from "next/link";
import { LayoutDashboard, ShoppingCart, CalendarClock, Settings } from "lucide-react";

type PPCTab = "home" | "orders" | "auto-planning" | "master";

interface PPCTabsProps {
    activeTab: PPCTab;
}

export default function PPCTabs({ activeTab }: PPCTabsProps) {
    const isHomeActive = activeTab === "home";
    const isOrdersActive = activeTab === "orders";
    const isAutoPlanningActive = activeTab === "auto-planning";
    const isMasterActive = activeTab === "master";

    const tabs = [
        { id: "home", label: "Overview", icon: LayoutDashboard, href: "/dashboard/ppc?tab=home", isActive: isHomeActive },
        { id: "orders", label: "Orders", icon: ShoppingCart, href: "/dashboard/ppc?tab=orders", isActive: isOrdersActive },
        { id: "auto-planning", label: "Planning", icon: CalendarClock, href: "/dashboard/ppc?tab=auto-planning", isActive: isAutoPlanningActive },
        { id: "master", label: "Masters", icon: Settings, href: "/dashboard/ppc?tab=master", isActive: isMasterActive },
    ];

    return (
        <>
            {/* Desktop View: Top Tabs */}
            <div className="hidden md:block mb-6 border-b border-gray-200 pb-1">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${tab.isActive
                                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Mobile View: Bottom Fixed Bar */}
            <div className="md:hidden fixed bottom-1 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-2xl z-50 flex justify-around py-3 px-2 safe-area-pb">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${tab.isActive
                                ? "text-indigo-600 scale-105"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${tab.isActive ? "bg-indigo-100" : "bg-transparent"}`}>
                                <Icon size={22} className={tab.isActive ? "stroke-indigo-600" : "stroke-current"} />
                            </div>
                            <span className="text-[10px] font-medium tracking-tight">
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
