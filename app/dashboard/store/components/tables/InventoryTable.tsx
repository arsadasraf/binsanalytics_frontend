/**
 * InventoryTable Component
 * 
 * Displays inventory data in a table format with columns for:
 * - Material name
 * - Material code
 * - Current stock (color-coded based on reorder level)
 * - Unit
 * - Location (from master data)
 * - Category (from master data)
 * - Actions (Edit/Delete)
 * 
 * @param data - Array of inventory items to display
 * @param onEdit - Function to handle edit action
 * @param onDelete - Function to handle delete action
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types/store.types';

interface InventoryTableProps {
    data: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export default function InventoryTable({ data, onEdit, onDelete }: InventoryTableProps) {
    return (
        <>
            {/* Table header */}
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Material</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Code</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.materialName}</td>
                        <td className="px-6 py-4 text-gray-600">{item.materialCode}</td>

                        {/* Stock with color coding - red if below reorder level, green otherwise */}
                        <td
                            className={`px-6 py-4 font-medium ${item.currentStock <= item.reorderLevel ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {item.currentStock}
                        </td>

                        <td className="px-6 py-4 text-gray-600">{item.unit}</td>

                        {/* Location from master data */}
                        <td className="px-6 py-4 text-gray-600">
                            {item.location?.name || '-'}
                        </td>

                        {/* Category from master data */}
                        <td className="px-6 py-4 text-gray-600">
                            {item.category?.name || '-'}
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(item._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </>
    );
}
