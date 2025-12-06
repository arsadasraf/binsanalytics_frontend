/**
 * DCTable Component
 * Displays Delivery Challan history
 * Features: E-way Bill Generation button, PDF Download, Edit/Delete
 */

import React from 'react';
import { Edit2, Trash2, Download, Truck, FileText } from 'lucide-react'; // Truck icon for E-way Bill
import { CompanyInfo } from '../../types/store.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
        const pageWidth = doc.internal.pageSize.width;

        // --- Header Section ---
        // Logo (Left)
        if (companyInfo?.logo) {
            try {
                doc.addImage(companyInfo.logo, 'JPEG', 15, 10, 25, 25);
            } catch (e) {
                console.warn("Logo add failed", e);
            }
        }

        // Company Details (Left, below logo or next to it if preferred. Let's stack below logo for sidebar feel or center?)
        // Modern Style: Company Top Left, DC Details Top Right.
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(companyInfo?.companyName || 'Company Name', 15, 40);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(companyInfo?.billingAddress || '', 15, 46, { maxWidth: 80 });
        if (companyInfo?.gstNumber) doc.text(`GSTIN: ${companyInfo.gstNumber}`, 15, 58);
        if (companyInfo?.contactNumber) doc.text(`Phone: ${companyInfo.contactNumber}`, 15, 63);

        // --- DC Title & Info (Right) ---
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235); // Blue 600
        doc.setFont('helvetica', 'bold');
        doc.text('DELIVERY CHALLAN', pageWidth - 15, 25, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.setFont('helvetica', 'normal');
        doc.text(`DC No: ${dc.dcNumber}`, pageWidth - 15, 35, { align: 'right' });
        doc.text(`Date: ${new Date(dc.date).toLocaleDateString()}`, pageWidth - 15, 40, { align: 'right' });
        doc.text(`Status: ${dc.status}`, pageWidth - 15, 45, { align: 'right' });

        // --- Customer Details (Right, below DC Info) ---
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text("Ship To:", pageWidth - 15, 55, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        // Check if customer is object or just ID/Name
        const custName = typeof dc.customer === 'object' ? dc.customer.name : dc.customerName;
        const custAddress = typeof dc.customer === 'object' ? dc.customer.address : '';
        const custGST = typeof dc.customer === 'object' ? dc.customer.gstNumber : '';

        doc.text(custName || 'N/A', pageWidth - 15, 60, { align: 'right' });
        if (custAddress) doc.text(custAddress, pageWidth - 15, 65, { align: 'right', maxWidth: 80 });
        // Adjust Y based on address lines? distinct vertical space prevents overlap but simple here.
        if (custGST) doc.text(`GSTIN: ${custGST}`, pageWidth - 15, 80, { align: 'right' });

        // --- Item Table ---
        const tableData = dc.items.map((item: any) => [
            item.materialName,
            item.hsnCode || '-',
            String(item.quantity),
            item.unit,
            item.description || '-'
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Material', 'HSN', 'Qty', 'Unit', 'Description']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [30, 41, 59], // Dark Slate
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249] // Slate 50
            }
        });

        // --- Footer ---
        const finalY = (doc as any).lastAutoTable?.finalY || 100;

        if (dc.otherDetails) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Remarks:', 15, finalY + 10);
            doc.setFont('helvetica', 'normal');
            doc.text(dc.otherDetails, 15, finalY + 16, { maxWidth: pageWidth - 30 });
        }

        // Signatory
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Authorized Signatory", pageWidth - 15, finalY + 40, { align: 'right' });

        doc.save(`DC_${dc.dcNumber}.pdf`);
    } catch (error) {
        console.error("PDF Error", error);
    }
};

const downloadSingleDCExcel = (dc: any, companyInfo?: CompanyInfo) => {
    try {
        // Prepare Header Info
        const custName = typeof dc.customer === 'object' ? dc.customer.name : dc.customerName;
        const custAddress = typeof dc.customer === 'object' ? dc.customer.address : '';
        const custGST = typeof dc.customer === 'object' ? dc.customer.gstNumber : '';

        const workbook = XLSX.utils.book_new();

        // We will build a customized array of arrays for the sheet to handle the header structure
        const sheetData = [
            // Company Info
            [companyInfo?.companyName || ''],
            [companyInfo?.billingAddress || ''],
            [`GSTIN: ${companyInfo?.gstNumber || ''}`],
            [],
            // DC Info
            ['DELIVERY CHALLAN'],
            ['DC Number', dc.dcNumber],
            ['Date', new Date(dc.date).toLocaleDateString()],
            ['Status', dc.status],
            [],
            // Customer Info
            ['Ship To:'],
            ['Name', custName],
            ['Address', custAddress],
            ['GSTIN', custGST],
            [],
            // Items Header
            ['Material', 'HSN Code', 'Quantity', 'Unit', 'Description'],
        ];

        // Add Items
        dc.items.forEach((item: any) => {
            sheetData.push([
                item.materialName,
                item.hsnCode || '-',
                item.quantity,
                item.unit,
                item.description || '-'
            ]);
        });

        if (dc.otherDetails) {
            sheetData.push([]);
            sheetData.push(['Remarks:', dc.otherDetails]);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // Optional: formatting column widths
        worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'DC Details');
        XLSX.writeFile(workbook, `DC_${dc.dcNumber}.xlsx`);
    } catch (err) {
        console.error("Excel Error", err);
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
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
                                        <button onClick={() => generateEWayBill(item)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Generate E-Way Bill"><Truck size={16} /></button>
                                        <button onClick={() => downloadSingleDCExcel(item, companyInfo)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Excel"><FileText size={16} /></button>
                                        <button onClick={() => downloadDCAsPDF(item, companyInfo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF"><Download size={16} /></button>
                                        <button onClick={() => onEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => onDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3 p-4">
                {data.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        {/* Card Header */}
                        <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                            <div>
                                <span className="text-xs font-medium text-gray-500 block mb-1">DC #{item.dcNumber}</span>
                                <h4 className="font-bold text-gray-900">{item.customerName}</h4>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Delivered' ? 'bg-green-100 text-green-800' : item.status === 'Issued' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
                        </div>

                        {/* Card Content Details */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Items:</span> <span>{item.items?.[0]?.materialName || '-'}{item.items?.length > 1 && <span className="text-xs text-blue-600 ml-1">(+{item.items.length - 1} more)</span>}</span></div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-1 flex-wrap">
                            <button onClick={() => generateEWayBill(item)} className="flex-1 py-2 text-orange-600 bg-orange-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Truck size={14} /> E-Way</button>
                            <button onClick={() => downloadSingleDCExcel(item, companyInfo)} className="flex-1 py-2 text-green-600 bg-green-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><FileText size={14} /> Excel</button>
                            <button onClick={() => downloadDCAsPDF(item, companyInfo)} className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Download size={14} /> PDF</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(item)} className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"><Edit2 size={16} /> Edit</button>
                            <button onClick={() => onDelete(item._id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"><Trash2 size={16} /> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
