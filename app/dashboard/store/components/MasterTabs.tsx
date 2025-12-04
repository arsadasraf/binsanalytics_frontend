/**
 * MasterTabs Component
 * 
 * Renders tab navigation for different master data types (Vendors, Customers, Locations, Categories).
 * Only displayed when the active main tab is "masters".
 * 
 * @param masterTab - Currently active master tab
 * @param setMasterTab - Function to change the active master tab
 */

import React from 'react';
import { MasterType } from '../types/store.types';

interface MasterTabsProps {
    masterTab: MasterType;
    setMasterTab: (tab: MasterType) => void;
}

export default function MasterTabs({ masterTab, setMasterTab }: MasterTabsProps) {
    // Define master tab options with labels
    const masterTabs: { value: MasterType; label: string }[] = [
        { value: "vendor", label: "Suppliers" },
        { value: "customer", label: "Customers" },
        { value: "location", label: "Locations" },
        { value: "category", label: "Categories" },
        { value: "material", label: "Materials" },
    ];

    return (
        <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
            {masterTabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => setMasterTab(tab.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${masterTab === tab.value
                        ? "bg-indigo-600 text-white"  // Active tab styling
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"  // Inactive tab styling
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
