import Link from "next/link";
import { Package, Layers, FileText, Settings, IndianRupee } from "lucide-react";
import { TabType } from "../types/store.types";

interface StoreTabsProps {
    activeTab: TabType;
}

export default function StoreTabs({ activeTab }: StoreTabsProps) {
    const isBillsActive = ["po", "dc", "billing"].includes(activeTab);
    const isMastersActive = activeTab === "masters";
    const isHomeActive = activeTab === "home";
    const isMaterialIssueActive = activeTab === "material-issue";

    const tabs = [
        { id: "home", label: "Inventory", icon: Package, href: "/dashboard/store?tab=home", isActive: isHomeActive },
        { id: "material-issue", label: "Issue", icon: Layers, href: "/dashboard/store?tab=material-issue", isActive: isMaterialIssueActive },
        { id: "bills", label: "Bills", icon: IndianRupee, href: "/dashboard/store?tab=dc", isActive: isBillsActive }, // Defaulting to DC for bills tab link
        { id: "masters", label: "Masters", icon: Settings, href: "/dashboard/store?tab=masters", isActive: isMastersActive },
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
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center w-full gap-1 transition-colors ${tab.isActive
                                ? "text-blue-600 scale-105"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${tab.isActive ? "bg-blue-100" : "bg-transparent"}`}>
                                <Icon size={22} className={tab.isActive ? "stroke-blue-600" : "stroke-current"} />
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
