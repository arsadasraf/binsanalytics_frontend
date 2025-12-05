import Link from "next/link";
import { Home, Database, UserCheck } from "lucide-react";

interface HRTabsProps {
    activeTab: "home" | "master" | "attendance";
}

export default function HRTabs({ activeTab }: HRTabsProps) {
    const isHomeActive = activeTab === "home";
    const isMasterActive = activeTab === "master";

    return (
        <div className="mb-6 border-b border-gray-200 pb-1">
            <div className="flex flex-wrap gap-2">
                <Link
                    href="/dashboard/hr?tab=home"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isHomeActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Home size={18} />
                    Home
                </Link>

                <Link
                    href="/dashboard/hr?tab=master"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${isMasterActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <Database size={18} />
                    Masters
                </Link>
                <Link
                    href="/dashboard/hr?tab=attendance"
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 ${activeTab === "attendance"
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <UserCheck size={18} />
                    Attendance
                </Link>
            </div>
        </div>
    );
}
