/**
 * TransactionsTable Component
 * 
 * Displays transaction records (GRN, DC, PO, Billing, Material Issue) in a table format.
 * Columns include:
 * - Number (GRN/DC/PO/Invoice number)
 * - Date
 * - Items count
 * - Actions (Edit/Delete)
 * 
 * @param data - Array of transaction items to display
 * @param onEdit - Function to handle edit action
 * @param onDelete - Function to handle delete action
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/store.types';

interface TransactionsTableProps {
    data: Transaction[];
    onEdit: (item: Transaction) => void;
    onDelete: (id: string) => void;
}

export default function TransactionsTable({ data, onEdit, onDelete }: TransactionsTableProps) {
    return (
        <>
            {/* Table header */}
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Number</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Items</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
                </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        {/* Display the appropriate number based on transaction type */}
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {item.grnNumber || item.dcNumber || item.poNumber || item.invoiceNumber || item.issueNumber}
                        </td>

                        {/* Format and display date */}
                        <td className="px-6 py-4 text-gray-600">
                            {new Date(item.date).toLocaleDateString()}
                        </td>

                        {/* Display items count */}
                        <td className="px-6 py-4 text-gray-600">
                            {item.items?.length || 0} items
                        </td>

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
