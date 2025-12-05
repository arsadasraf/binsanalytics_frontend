/**
 * POTable Component
 * 
 * Displays Purchase Order history in the PO tab
 * Features:
 * - PO list with download buttons (PDF/Excel)
 * - 12-hour edit/delete restriction
 * - Purple-themed UI matching PO module
 */

import React from 'react';
import { Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface POTableProps {
    data: any[];
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

const isWithin12Hours = (createdAt: string | Date): boolean => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 12;
};

const downloadPOAsPDF = (po: any) => {
    try {
        console.log('Generating PDF for PO:', po);
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Purchase Order', 105, 20, { align: 'center' } as any);

        doc.setFontSize(11);
        doc.text(`PO Number: ${po.poNumber}`, 20, 35);
        doc.text(`Date: ${new Date(po.date).toLocaleDateString()}`, 20, 42);
        doc.text(`Vendor: ${po.vendorName || po.vendor?.name || 'N/A'}`, 20, 49);
        doc.text(`Status: ${po.status}`, 20, 56);

        // Handle both single material and items array
        const items = po.items && po.items.length > 0 ? po.items : [{
            materialName: po.materialName,
            quantity: po.quantity,
            unit: po.unit,
            rate: po.rate,
            amount: po.amount
        }];

        const tableData = items.map((item: any) => [
            item.materialName || 'N/A',
            String(item.quantity || 0),
            item.unit || 'PCS',
            String(item.rate || 0),
            String(item.amount || 0),
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['Material', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [147, 51, 234] },
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(11);
        doc.text(`Total Amount: ₹ ${(po.totalAmount || po.amount || 0).toFixed(2)}`, 20, finalY + 10);

        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, finalY + 20, { align: 'center' } as any);

        const filename = `PO_${po.poNumber.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error('PDF Error:', error);
        alert(`PDF Error: ${(error as any)?.message}`);
    }
};

const downloadPOAsExcel = (po: any) => {
    const poDetails = [
        ['Purchase Order'],
        [],
        ['PO Number:', po.poNumber],
        ['Date:', new Date(po.date).toLocaleDateString()],
        ['Vendor:', po.vendorName || po.vendor?.name || 'N/A'],
        ['Status:', po.status],
        [],
        ['Material', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)'],
    ];

    const items = po.items && po.items.length > 0 ? po.items : [{
        materialName: po.materialName,
        quantity: po.quantity,
        unit: po.unit,
        rate: po.rate,
        amount: po.amount
    }];

    items.forEach((item: any) => {
        poDetails.push([
            item.materialName || 'N/A',
            item.quantity || 0,
            item.unit || 'PCS',
            item.rate || 0,
            item.amount || 0,
        ]);
    });

    poDetails.push([]);
    poDetails.push(['Total Amount:', '', '', '', po.totalAmount || po.amount || 0]);

    const worksheet = XLSX.utils.aoa_to_sheet(poDetails);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PO');
    XLSX.writeFile(workbook, `PO_${po.poNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export default function POTable({ data, onEdit, onDelete }: POTableProps) {
    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No Purchase Orders yet</p>
                <p className="text-gray-400 text-sm mt-2">Click "Create Purchase Order" to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50 border-b border-purple-100">
                    <tr>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">PO Number</th>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">Date</th>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">Vendor</th>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">Materials</th>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">Amount (₹)</th>
                        <th className="px-6 py-3 text-left font-semibold text-purple-900">Status</th>
                        <th className="px-6 py-3 text-right font-semibold text-purple-900">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-purple-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.poNumber}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-gray-600">{item.vendorName || item.vendor?.name || '-'}</td>
                            <td className="px-6 py-4 text-gray-600">
                                {(item.items && item.items.length > 0 ? item.items[0]?.materialName : item.materialName) || '-'}
                                {item.items?.length > 1 && <span className="text-xs text-purple-600 ml-1 font-medium">(+{item.items.length - 1} more)</span>}
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">₹ {(item.totalAmount || item.amount || 0).toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Released' ? 'bg-purple-100 text-purple-800' :
                                        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            item.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => downloadPOAsPDF(item)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => downloadPOAsExcel(item)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Download Excel"
                                    >
                                        <FileSpreadsheet size={16} />
                                    </button>
                                    {isWithin12Hours(item.createdAt || item.date) ? (
                                        <>
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit PO"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete PO"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                                                title="Cannot edit: 12-hour limit exceeded"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                disabled
                                                className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                                                title="Cannot delete: 12-hour limit exceeded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
