/**
 * MastersTable Component
 * 
 * Displays master data (Vendor, Customer, Location, Category, Material) in a table format.
 * Columns are conditionally rendered based on the master type:
 * - All types: Name, Code
 * - Vendor/Customer: Contact Person, Email
 * - Material: Category, Unit
 * - All types: Actions (Edit/Delete)
 * 
 * @param data - Array of master data items to display
 * @param masterTab - Current master tab type
 * @param onEdit - Function to handle edit action
 * @param onDelete - Function to handle delete action
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { MasterType } from '../../types/store.types';

interface MastersTableProps {
    data: any[];
    masterTab: MasterType;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

export default function MastersTable({ data, masterTab, onEdit, onDelete }: MastersTableProps) {
    return (
        <>
            {/* Table header with conditional columns */}
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    {masterTab !== "grn-history" && (
                        <>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Code</th>
                        </>
                    )}

                    {/* GRN History columns */}
                    {masterTab === "grn-history" && (
                        <>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">GRN Number</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Supplier</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Material</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Quantity</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                        </>
                    )}

                    {/* Additional columns for vendor and customer */}
                    {(masterTab === "vendor" || masterTab === "customer") && (
                        <>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Contact</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                        </>
                    )}

                    {/* Additional columns for material */}
                    {masterTab === "material" && (
                        <>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Unit</th>
                        </>
                    )}

                    <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
                </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        {/* GRN History rows */}
                        {masterTab === "grn-history" && (
                            <>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.grnNumber}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.supplierName}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {item.items?.[0]?.materialName || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {item.items?.[0]?.quantity} {item.items?.[0]?.unit}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Received' ? 'bg-green-100 text-green-800' :
                                        item.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                            item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </>
                        )}

                        {/* Regular master data rows */}
                        {masterTab !== "grn-history" && (
                            <>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-gray-600">{item.code}</td>

                                {/* Conditional columns for vendor/customer */}
                                {(masterTab === "vendor" || masterTab === "customer") && (
                                    <>
                                        <td className="px-6 py-4 text-gray-600">{item.contactPerson}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.email}</td>
                                    </>
                                )}

                                {/* Conditional columns for material */}
                                {masterTab === "material" && (
                                    <>
                                        <td className="px-6 py-4 text-gray-600">{item.categoryId?.name || item.category?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.categoryId?.unit || item.category?.unit || '-'}</td>
                                    </>
                                )}
                            </>
                        )}

                        {/* Action buttons aligned to the right */}
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
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
