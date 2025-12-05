/**
 * POTable Component
 * 
 * Displays Purchase Order history in the PO tab
 * Features:
 * - PO list with download buttons (PDF/Excel)
 * - 12-hour edit/delete restriction
 * - Purple-themed UI matching PO module
 * - Professional PDF/Excel generation with Company Info
 */

import React from 'react';
import { Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CompanyInfo } from '../../types/store.types';

interface POTableProps {
    data: any[];
    companyInfo?: CompanyInfo;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

const isWithin12Hours = (createdAt: string | Date): boolean => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 12;
};

const downloadPOAsPDF = (po: any, companyInfo?: CompanyInfo) => {
    try {
        console.log('Generating PDF for PO:', po);
        const doc = new jsPDF();

        // --- Header Section ---
        // Company Name
        doc.setFontSize(22);
        doc.setTextColor(147, 51, 234); // Purple color
        doc.text(companyInfo?.companyName || 'Company Name', 20, 20);

        // Company Details (Right aligned)
        doc.setFontSize(10);
        doc.setTextColor(100);
        const rightMargin = 190;
        let yPos = 20;

        if (companyInfo) {
            if (companyInfo.contactNumber) {
                doc.text(`Ph: ${companyInfo.contactNumber}`, rightMargin, yPos, { align: 'right' });
                yPos += 5;
            }
            if (companyInfo.email) {
                doc.text(`Email: ${companyInfo.email}`, rightMargin, yPos, { align: 'right' });
                yPos += 5;
            }
            if (companyInfo.gstNumber) {
                doc.text(`GSTIN: ${companyInfo.gstNumber}`, rightMargin, yPos, { align: 'right' });
                yPos += 5;
            }
        }

        // Address (Below Company Name)
        doc.setFontSize(10);
        doc.setTextColor(80);
        const addressLines = doc.splitTextToSize(companyInfo?.billingAddress || '', 80);
        doc.text(addressLines, 20, 30);

        // Line Separator
        doc.setDrawColor(200);
        doc.line(20, 45, 190, 45);

        // --- PO Details Section ---
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('PURCHASE ORDER', 105, 55, { align: 'center' } as any);

        doc.setFontSize(10);
        doc.text(`PO Number: ${po.poNumber}`, 20, 65);
        doc.text(`Date: ${new Date(po.date).toLocaleDateString()}`, 20, 70);
        doc.text(`Status: ${po.status}`, 20, 75);

        doc.text(`Vendor:`, 140, 65);
        doc.setFontSize(11);
        doc.text(`${po.vendorName || po.vendor?.name || 'N/A'}`, 140, 70);

        // --- Items Table ---
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
            startY: 85,
            head: [['Material', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [147, 51, 234],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: { fontSize: 10, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 243, 255] } // Light purple alternate rows
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 100;

        // --- Totals Section ---
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: ₹ ${(po.totalAmount || po.amount || 0).toFixed(2)}`, 140, finalY + 10);
        doc.setFont('helvetica', 'normal');

        // --- Footer Section ---
        let footerY = finalY + 25;

        if (companyInfo?.commercialTerms) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Terms & Conditions:', 20, footerY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80);
            const termsLines = doc.splitTextToSize(companyInfo.commercialTerms, 170);
            doc.text(termsLines, 20, footerY + 5);
            footerY += 10 + (termsLines.length * 4);
        }

        if (companyInfo?.qualitySpecs) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('Quality Specifications:', 20, footerY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(80);
            const specsLines = doc.splitTextToSize(companyInfo.qualitySpecs, 170);
            doc.text(specsLines, 20, footerY + 5);
            footerY += 10 + (specsLines.length * 4);
        }

        // Signatory
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text('Authorized Signatory', 150, footerY + 20);
        doc.text('___________________', 150, footerY + 35);
        doc.setFontSize(8);
        doc.text(`For ${companyInfo?.companyName || 'Company'}`, 150, footerY + 40);

        // Generated timestamp
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 290, { align: 'center' } as any);

        const filename = `PO_${po.poNumber.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error('PDF Error:', error);
        alert(`PDF Error: ${(error as any)?.message}`);
    }
};

const downloadPOAsExcel = (po: any, companyInfo?: CompanyInfo) => {
    const poDetails = [
        [companyInfo?.companyName || 'Purchase Order'],
        [companyInfo?.billingAddress || ''],
        [`GSTIN: ${companyInfo?.gstNumber || ''}`],
        [],
        ['PURCHASE ORDER'],
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

    if (companyInfo?.commercialTerms) {
        poDetails.push([]);
        poDetails.push(['Terms & Conditions:', companyInfo.commercialTerms]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(poDetails);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PO');
    XLSX.writeFile(workbook, `PO_${po.poNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export default function POTable({ data, companyInfo, onEdit, onDelete }: POTableProps) {
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
                                        onClick={() => downloadPOAsPDF(item, companyInfo)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => downloadPOAsExcel(item, companyInfo)}
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
