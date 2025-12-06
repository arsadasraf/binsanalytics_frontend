/**
 * InventoryTable Component
 * 
 * Displays inventory data in a table format with columns for:
 * - Material name
 * - Material code  
 * - Current stock (color-coded based on reorder level)
 * - Unit
 * - Category (from master data)
 * - Location (from master data)
 * 
 * @param data - Array of inventory items to display
 */

import React from 'react';
import { InventoryItem } from '../../types/store.types';

interface InventoryTableProps {
    data: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export default function InventoryTable({ data }: InventoryTableProps) {
    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Material</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Stock</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Unit</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{item.materialName}</td>
                                <td className={`px-6 py-4 font-medium ${item.currentStock <= item.reorderLevel ? "text-red-600" : "text-green-600"}`}>
                                    {item.currentStock}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {(typeof item.categoryId === 'object' && item.categoryId?.name) ||
                                        item.category?.name || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {(typeof item.locationId === 'object' && item.locationId?.name) ||
                                        item.location?.name || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3 p-4">
                {data.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-900">{item.materialName}</h4>
                                <p className="text-xs text-gray-500">{item.materialCode || "No Code"}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.currentStock <= item.reorderLevel ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {item.currentStock} {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">Category</span>
                                <span className="text-gray-700 font-medium">
                                    {(typeof item.categoryId === 'object' && item.categoryId?.name) || item.category?.name || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Location</span>
                                <span className="text-gray-700 font-medium">
                                    {(typeof item.locationId === 'object' && item.locationId?.name) || item.location?.name || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
