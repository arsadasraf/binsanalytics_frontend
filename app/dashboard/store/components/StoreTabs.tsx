import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabType } from "../types/store.types";
import { Package, FileText, Settings, Layers } from "lucide-react";

interface StoreTabsProps {
    activeTab: TabType;
}

export default function StoreTabs({ activeTab }: StoreTabsProps) {
    // Define main categories. 
    // For 'Bills', we activate it if any bill type is selected. Default link to 'dc' or 'po'.
    // For 'Masters', link to 'masters'.

    const isBillsActive = ["po", "dc", "billing"].includes(activeTab);
    const isMastersActive = activeTab === "masters";
    const isHomeActive = activeTab === "home";
    const isMaterialIssueActive = activeTab === "material-issue";

    const router = useRouter(); // Import useRouter at top level if not imported

    const handleMobileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        router.push(`/dashboard/store?tab=${value}`);
    };

    return (
        <div className="mb-6 border-b border-gray-200 pb-1">
            {/* Desktop Tabs */}
            <div className="hidden md:flex flex-wrap gap-2">
                <Link
                    href="/dashboard/store?tab=home"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isHomeActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Package size={18} />
                    Inventory
                </Link>

                <Link
                    href="/dashboard/store?tab=material-issue"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isMaterialIssueActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Layers size={18} />
                    Material Issue
                </Link>

                <Link
                    href="/dashboard/store?tab=dc"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isBillsActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <FileText size={18} />
                    Bills & Challans
                </Link>

                <Link
                    href="/dashboard/store?tab=masters"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isMastersActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Settings size={18} />
                    Masters
                </Link>
            </div>
        </div>
    );
}
