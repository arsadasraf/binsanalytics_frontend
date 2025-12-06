/**
 * StoreTable Component
 * 
 * Main table wrapper that conditionally renders the appropriate table based on the active tab.
 * Handles loading states and empty data states.
 * Integrates InventoryTable, MastersTable, and TransactionsTable components.
 * 
 * @param activeTab - Current active main tab
 * @param masterTab - Current active master tab (if in masters section)
 * @param data - Array of data items to display
 * @param loading - Loading state
 * @param onEdit - Function to handle edit action
 * @param onDelete - Function to handle delete action
 */

import React from 'react';
import { Database } from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { TabType, MasterType } from '../../types/store.types';
import InventoryTable from './InventoryTable';
import MastersTable from './MastersTable';
import TransactionsTable from './TransactionsTable';

interface StoreTableProps {
    activeTab: TabType;
    masterTab: MasterType;
    data: any[];
    loading: boolean;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

export default function StoreTable({ activeTab, masterTab, data, loading, onEdit, onDelete }: StoreTableProps) {
    // Show loading spinner while data is being fetched
    if (loading) return <LoadingSpinner />;

    // Show empty state if no data is available
    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Database className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                <p className="text-gray-500 mt-1">Create a new record to get started</p>
            </div>
        );
    }

    // Render table with data
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Conditionally render the appropriate table based on active tab */}
            {activeTab === "home" && (
                <InventoryTable data={data} onEdit={onEdit} onDelete={onDelete} />
            )}

            {activeTab === "masters" && (
                <MastersTable data={data} masterTab={masterTab} onEdit={onEdit} onDelete={onDelete} />
            )}

            {/* All transaction tabs use the same TransactionsTable component */}
            {!["home", "masters"].includes(activeTab) && (
                <TransactionsTable data={data} onEdit={onEdit} onDelete={onDelete} />
            )}
        </div>
    );
}
