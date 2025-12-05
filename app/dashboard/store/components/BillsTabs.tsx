/**
 * BillsTabs Component
 * Sub-tab navigation for Bills section (DC, Billing, PO Release)
 * Similar to MasterTabs component
 */

import { BillsTabType } from "../types/store.types";

interface BillsTabsProps {
  billsTab: BillsTabType;
  setBillsTab: (tab: BillsTabType) => void;
}

export default function BillsTabs({ billsTab, setBillsTab }: BillsTabsProps) {

  const tabs: { id: BillsTabType; label: string }[] = [
    { id: "dc", label: "Delivery Challan" },
    { id: "billing", label: "Invoice/Billing" },
    { id: "po", label: "PO Release" },
  ];

  return (
    <div className="flex gap-2 bg-white p-4 rounded-xl shadow-sm mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setBillsTab(tab.id)}
          className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${billsTab === tab.id
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } 
                    `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
