/**
 * BillingTable Component
 * Displays Invoice history
 * Features: E-way Bill Generation button, PDF Download, Edit/Delete
 */

import React from 'react';
import { Edit2, Trash2, Download, Truck, FileText } from 'lucide-react';
import { CompanyInfo } from '../../types/store.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface BillingTableProps {
    data: any[];
    companyInfo?: CompanyInfo;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

const generateEWayBill = (invoice: any) => {
    alert(`Generating E-Way Bill for Invoice: ${invoice.invoiceNumber}`);
};

const downloadInvoiceAsPDF = (invoice: any, companyInfo?: CompanyInfo) => {
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

        // Company Details (Left)
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

        // --- Invoice Title & Info (Right) ---
        doc.setFontSize(24);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE', pageWidth - 15, 25, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - 15, 35, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, pageWidth - 15, 40, { align: 'right' });
        doc.text(`Status: ${invoice.status}`, pageWidth - 15, 45, { align: 'right' });

        // --- Customer Details (Right, below Info) ---
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text("Bill To:", pageWidth - 15, 55, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);

        const custName = typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customerName;
        const custAddress = typeof invoice.customer === 'object' ? invoice.customer.address : (invoice.customerAddress || '');
        const custGST = typeof invoice.customer === 'object' ? invoice.customer.gstNumber : (invoice.customerGST || '');

        doc.text(custName || 'N/A', pageWidth - 15, 60, { align: 'right' });
        if (custAddress) doc.text(custAddress, pageWidth - 15, 65, { align: 'right', maxWidth: 80 });
        if (custGST) doc.text(`GSTIN: ${custGST}`, pageWidth - 15, 80, { align: 'right' }); // Approx Y based on address

        // --- Item Table ---
        const tableData = invoice.items.map((item: any) => [
            item.materialName,
            item.hsnCode || '-',
            String(item.quantity),
            String(item.rate),
            String(item.taxRate || 0) + '%',
            String(((item.amount || 0) + (item.taxAmount || 0)).toFixed(2))
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Item', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [79, 70, 229], // Indigo 600
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [243, 244, 246] }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 120;

        // --- Totals Section (Right) ---
        const totalsX = pageWidth - 70;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        doc.text(`Subtotal:`, totalsX, finalY + 10);
        doc.text(`${(invoice.subtotal || 0).toFixed(2)}`, pageWidth - 15, finalY + 10, { align: 'right' });

        doc.text(`Tax:`, totalsX, finalY + 16);
        doc.text(`${(invoice.taxAmount || 0).toFixed(2)}`, pageWidth - 15, finalY + 16, { align: 'right' });

        if (invoice.discount) {
            doc.text(`Discount:`, totalsX, finalY + 22);
            doc.text(`-${Number(invoice.discount).toFixed(2)}`, pageWidth - 15, finalY + 22, { align: 'right' });
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total:`, totalsX, finalY + 32);
        doc.text(`${(invoice.totalAmount || 0).toFixed(2)}`, pageWidth - 15, finalY + 32, { align: 'right' });

        // --- Footer (Bank & Terms) ---
        const footerY = finalY + 50;

        // Bank Details
        if (companyInfo?.bankDetails) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("Bank Details:", 15, footerY);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Bank: ${companyInfo.bankDetails.bankName || '-'}`, 15, footerY + 6);
            doc.text(`A/c No: ${companyInfo.bankDetails.accountNumber || '-'}`, 15, footerY + 11);
            doc.text(`IFSC: ${companyInfo.bankDetails.ifscCode || '-'}`, 15, footerY + 16);
        }

        // Terms
        if (companyInfo?.commercialTerms) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text("Terms & Conditions:", 15, footerY + 30);
            doc.setFont('helvetica', 'normal');
            doc.text(companyInfo.commercialTerms, 15, footerY + 36, { maxWidth: 100 });
        }

        // Signatory
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Authorized Signatory", pageWidth - 15, footerY + 10, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`For ${companyInfo?.companyName || 'Company'}`, pageWidth - 15, footerY + 16, { align: 'right' });

        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("PDF Error", error);
        alert("Failed to generate PDF. check console details.");
    }
};

const downloadSingleBillingExcel = (invoice: any, companyInfo?: CompanyInfo) => {
    try {
        // Customer Info
        const custName = typeof invoice.customer === 'object' ? invoice.customer.name : invoice.customerName;
        const custAddress = typeof invoice.customer === 'object' ? invoice.customer.address : (invoice.customerAddress || '');
        const custGST = typeof invoice.customer === 'object' ? invoice.customer.gstNumber : (invoice.customerGST || '');

        const workbook = XLSX.utils.book_new();

        const sheetData = [
            // Company Info
            [companyInfo?.companyName || ''],
            [companyInfo?.billingAddress || ''],
            [`GSTIN: ${companyInfo?.gstNumber || ''}`],
            [],
            // Invoice Info
            ['TAX INVOICE'],
            ['Invoice No', invoice.invoiceNumber],
            ['Date', new Date(invoice.date).toLocaleDateString()],
            ['Status', invoice.status],
            [],
            // Customer Info
            ['Bill To:'],
            ['Name', custName],
            ['Address', custAddress],
            ['GSTIN', custGST],
            [],
            // Items Header
            ['Item', 'HSN Code', 'Quantity', 'Rate', 'Tax Rate', 'Tax Amount', 'Amount'],
        ];

        // Items
        invoice.items.forEach((item: any) => {
            sheetData.push([
                item.materialName,
                item.hsnCode || '-',
                item.quantity,
                item.rate,
                item.taxRate ? `${item.taxRate}%` : '0%',
                item.taxAmount,
                item.amount
            ]);
        });

        sheetData.push([]);
        sheetData.push(['', '', '', '', 'Subtotal', invoice.subtotal]);
        sheetData.push(['', '', '', '', 'Tax', invoice.taxAmount]);
        sheetData.push(['', '', '', '', 'Total', invoice.totalAmount]);

        // Bank Details
        if (companyInfo?.bankDetails) {
            sheetData.push([]);
            sheetData.push(['Bank Details:']);
            sheetData.push(['Bank', companyInfo.bankDetails.bankName]);
            sheetData.push(['Account No', companyInfo.bankDetails.accountNumber]);
            sheetData.push(['IFSC', companyInfo.bankDetails.ifscCode]);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        // Column widths
        worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Details');
        XLSX.writeFile(workbook, `Invoice_${invoice.invoiceNumber}.xlsx`);
    } catch (err) {
        console.error("Excel Error", err);
    }
};

export default function BillingTable({ data, companyInfo, onEdit, onDelete }: BillingTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No Invoices found</p>
                <p className="text-gray-400 text-sm mt-2">Create a new Invoice to get started</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50 border-b border-indigo-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-indigo-900">Invoice No</th>
                            <th className="px-6 py-3 text-left font-semibold text-indigo-900">Date</th>
                            <th className="px-6 py-3 text-left font-semibold text-indigo-900">Customer</th>
                            <th className="px-6 py-3 text-left font-semibold text-indigo-900">Amount</th>
                            <th className="px-6 py-3 text-left font-semibold text-indigo-900">Status</th>
                            <th className="px-6 py-3 text-right font-semibold text-indigo-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((item) => (
                            <tr key={item._id} className="hover:bg-indigo-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{item.invoiceNumber}</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-gray-600">{item.customerName}</td>
                                <td className="px-6 py-4 text-indigo-600 font-semibold">₹ {(item.totalAmount || 0).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                        item.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => generateEWayBill(item)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Generate E-Way Bill"><Truck size={16} /></button>
                                        <button onClick={() => downloadSingleBillingExcel(item, companyInfo)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Excel"><FileText size={16} /></button>
                                        <button onClick={() => downloadInvoiceAsPDF(item, companyInfo)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF"><Download size={16} /></button>
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
                                <span className="text-xs font-medium text-gray-500 block mb-1">Inv #{item.invoiceNumber}</span>
                                <h4 className="font-bold text-gray-900">{item.customerName}</h4>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : item.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
                        </div>

                        {/* Card Content Details */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span className="font-bold text-indigo-600">₹ {(item.totalAmount || 0).toFixed(2)}</span></div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-1 flex-wrap">
                            <button onClick={() => generateEWayBill(item)} className="flex-1 py-2 text-orange-600 bg-orange-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Truck size={14} /> E-Way</button>
                            <button onClick={() => downloadSingleBillingExcel(item, companyInfo)} className="flex-1 py-2 text-green-600 bg-green-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><FileText size={14} /> Excel</button>
                            <button onClick={() => downloadInvoiceAsPDF(item, companyInfo)} className="flex-1 py-2 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Download size={14} /> PDF</button>
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
