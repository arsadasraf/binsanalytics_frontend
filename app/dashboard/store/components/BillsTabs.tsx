/**
 * BillsTabs Component
 * Sub-tab navigation for Bills section (DC, Billing, PO Release)
 * Similar to MasterTabs component
 */

import Link from "next/link";
import { TabType } from "../types/store.types";

interface BillsTabsProps {
  activeTab: TabType;
}

export default function BillsTabs({ activeTab }: BillsTabsProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "dc", label: "Delivery Challan" },
    { id: "billing", label: "Invoice/Billing" },
    { id: "po", label: "PO Release" },
  ];

  return (
    <div className="flex gap-2 bg-white p-4 rounded-xl shadow-sm mb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard/store?tab=${tab.id}`}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${activeTab === tab.id
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } 
          `}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
