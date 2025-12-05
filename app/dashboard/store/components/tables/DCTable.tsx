/**
 * DCTable Component
 * Displays Delivery Challan history
 * Features: E-way Bill Generation button, PDF Download, Edit/Delete
 */

import React from 'react';
import { Edit2, Trash2, Download, Truck } from 'lucide-react'; // Truck icon for E-way Bill
import { CompanyInfo } from '../../types/store.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DCTableProps {
    data: any[];
    companyInfo?: CompanyInfo;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

const generateEWayBill = (dc: any) => {
    // Placeholder for E-way bill generation logic
    alert(`Generating E-Way Bill for DC: ${dc.dcNumber}`);
};

const downloadDCAsPDF = (dc: any, companyInfo?: CompanyInfo) => {
    try {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Blue
        doc.text(companyInfo?.companyName || 'Company Name', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(companyInfo?.billingAddress || '', 20, 30);

        // Title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('DELIVERY CHALLAN', 105, 50, { align: 'center' } as any);

        // DC Details
        doc.setFontSize(10);
        doc.text(`DC Number: ${dc.dcNumber}`, 20, 65);
        doc.text(`Date: ${new Date(dc.date).toLocaleDateString()}`, 20, 70);
        doc.text(`Status: ${dc.status}`, 20, 75);

        doc.text(`Customer:`, 140, 65);
        doc.text(`${dc.customerName}`, 140, 70);

        // Table
        const tableData = dc.items.map((item: any) => [
            item.materialName,
            item.hsnCode || '-',
            String(item.quantity),
            item.unit,
            item.description || '-'
        ]);

        autoTable(doc, {
            startY: 85,
            head: [['Material', 'HSN', 'Qty', 'Unit', 'Description']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
        });

        // Footer
        if (dc.otherDetails) {
            const finalY = (doc as any).lastAutoTable?.finalY || 100;
            doc.text('Remarks:', 20, finalY + 10);
            doc.text(dc.otherDetails, 20, finalY + 15);
        }

        doc.save(`DC_${dc.dcNumber}.pdf`);
    } catch (error) {
        console.error("PDF Error", error);
    }
};

export default function DCTable({ data, companyInfo, onEdit, onDelete }: DCTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No Delivery Challans found</p>
                <p className="text-gray-400 text-sm mt-2">Create a new DC to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 border-b border-blue-100">
                    <tr>
                        <th className="px-6 py-3 text-left font-semibold text-blue-900">DC Number</th>
                        <th className="px-6 py-3 text-left font-semibold text-blue-900">Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-blue-900">Customer</th>
                        <th className="px-6 py-3 text-left font-semibold text-blue-900">Items</th>
                        <th className="px-6 py-3 text-left font-semibold text-blue-900">Status</th>
                        <th className="px-6 py-3 text-right font-semibold text-blue-900">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.dcNumber}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-gray-600">{item.customerName}</td>
                            <td className="px-6 py-4 text-gray-600">
                                {item.items?.[0]?.materialName || '-'}
                                {item.items?.length > 1 && <span className="text-xs text-blue-600 ml-1">(+{item.items.length - 1} more)</span>}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        item.status === 'Issued' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => generateEWayBill(item)}
                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Generate E-Way Bill"
                                    >
                                        <Truck size={16} />
                                    </button>
                                    <button
                                        onClick={() => downloadDCAsPDF(item, companyInfo)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
