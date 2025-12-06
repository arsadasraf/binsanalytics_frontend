import Link from "next/link";
import { Home, Database, UserCheck, Banknote, ScanFace, ClipboardList } from "lucide-react";

interface HRTabsProps {
    activeTab: "home" | "master" | "attendance" | "present" | "salaries";
}

export default function HRTabs({ activeTab }: HRTabsProps) {
    const isHomeActive = activeTab === "home";
    const isMasterActive = activeTab === "master";

    const tabs = [
        { id: "home", label: "Home", icon: Home, href: "/dashboard/hr?tab=home" },
        { id: "master", label: "Masters", icon: Database, href: "/dashboard/hr?tab=master" },
        { id: "attendance", label: "Kiosk", icon: ScanFace, href: "/dashboard/hr?tab=attendance" },
        { id: "present", label: "Present", icon: ClipboardList, href: "/dashboard/hr?tab=present" },
        { id: "salaries", label: "Salaries", icon: Banknote, href: "/dashboard/hr?tab=salaries" },
    ];

    return (
        <>
            {/* Desktop View: Top Tabs */}
            <div className="hidden md:block mb-6 border-b border-gray-200 pb-1">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isActive
                                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
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
                    const isActive = activeTab === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${isActive
                                ? "text-blue-600 scale-105"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-blue-100" : "bg-transparent"}`}>
                                <Icon size={22} className={isActive ? "stroke-blue-600" : "stroke-current"} />
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
