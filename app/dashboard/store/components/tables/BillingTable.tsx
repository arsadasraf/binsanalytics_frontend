/**
 * BillingTable Component
 * Displays Invoice history
 * Features: E-way Bill Generation button, PDF Download, Edit/Delete
 */

import React from 'react';
import { Edit2, Trash2, Download, Truck } from 'lucide-react';
import { CompanyInfo } from '../../types/store.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

        // Logo
        if (companyInfo?.logo) {
            try {
                // Attempt to add logo if it's a valid image URL/Base64
                // Note: Remote URLs might fail due to CORS if not proxied/configured
                doc.addImage(companyInfo.logo, 'JPEG', 20, 10, 30, 30);
            } catch (e) {
                console.warn("Could not add logo to PDF", e);
            }
        }

        // Company Header (Right Aligned or Centered if no logo?)
        // Let's keep Standard Format: Left Logo, Right Company Details or Stacked

        // Company Name & Address (Left aligned below logo or right aligned?)
        // Standard: Logo Top Left, Company Name Top Right or Center.
        // Let's put Company Details on the Right for balance.

        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // Indigo
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo?.companyName || 'Company Name', pageWidth - 20, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(companyInfo?.billingAddress || '', pageWidth - 20, 30, { align: 'right', maxWidth: 80 });
        if (companyInfo?.gstNumber) {
            doc.text(`GSTIN: ${companyInfo.gstNumber}`, pageWidth - 20, 45, { align: 'right' });
        }
        if (companyInfo?.contactNumber) {
            doc.text(`Phone: ${companyInfo.contactNumber}`, pageWidth - 20, 50, { align: 'right' });
        }

        // Title
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE', 20, 60);

        // Divider
        doc.setDrawColor(200);
        doc.line(20, 65, pageWidth - 20, 65);

        // Invoice & Customer Details
        doc.setFontSize(10);
        doc.setTextColor(0);

        // Left Column: Invoice Details
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 82);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 87);
        doc.text(`Status: ${invoice.status}`, 20, 92);

        // Right Column: Bill To
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 120, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customerName, 120, 82);
        if (invoice.customerAddress) {
            doc.text(invoice.customerAddress, 120, 87, { maxWidth: 70 });
        }
        if (invoice.customerGST) {
            doc.text(`GSTIN: ${invoice.customerGST}`, 120, 105); // Adjust Y based on address length usually, but hardcoded for now
        }

        // Table
        const tableData = invoice.items.map((item: any) => [
            item.materialName,
            item.hsnCode || '-',
            String(item.quantity),
            String(item.rate),
            String(item.taxRate || 0) + '%',
            String(((item.amount || 0) + (item.taxAmount || 0)).toFixed(2))
        ]);

        autoTable(doc, {
            startY: 115,
            head: [['Item', 'HSN', 'Qty', 'Rate', 'Tax', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 9, cellPadding: 3 },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 120;

        // Totals Section (Right Aligned)
        const totalsX = pageWidth - 60;
        doc.text(`Subtotal:`, totalsX, finalY + 10);
        doc.text(`${(invoice.subtotal || 0).toFixed(2)}`, pageWidth - 20, finalY + 10, { align: 'right' });

        doc.text(`Tax:`, totalsX, finalY + 15);
        doc.text(`${(invoice.taxAmount || 0).toFixed(2)}`, pageWidth - 20, finalY + 15, { align: 'right' });

        if (invoice.discount) {
            doc.text(`Discount:`, totalsX, finalY + 20);
            doc.text(`-${invoice.discount.toFixed(2)}`, pageWidth - 20, finalY + 20, { align: 'right' });
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total:`, totalsX, finalY + 30);
        doc.text(`${(invoice.totalAmount || 0).toFixed(2)}`, pageWidth - 20, finalY + 30, { align: 'right' });

        // Footer Section: Bank Details & Signatory
        const footerY = finalY + 45;

        // Bank Details (Left)
        if (companyInfo?.bankDetails) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("Bank Details:", 20, footerY);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Bank: ${companyInfo.bankDetails.bankName || '-'}`, 20, footerY + 6);
            doc.text(`A/c No: ${companyInfo.bankDetails.accountNumber || '-'}`, 20, footerY + 11);
            doc.text(`IFSC: ${companyInfo.bankDetails.ifscCode || '-'}`, 20, footerY + 16);
            doc.text(`Branch: ${companyInfo.bankDetails.branch || '-'}`, 20, footerY + 21);
            if (companyInfo.bankDetails.accountName) {
                doc.text(`A/c Name: ${companyInfo.bankDetails.accountName}`, 20, footerY + 26);
            }
        }

        // Terms (Below Bank Details or Side?)
        if (companyInfo?.commercialTerms) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text("Terms & Conditions:", 20, footerY + 40);
            doc.setFont('helvetica', 'normal');
            doc.text(companyInfo.commercialTerms, 20, footerY + 46, { maxWidth: 100 });
        }

        // Authorized Signatory (Right)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("For " + (companyInfo?.companyName || "Company"), pageWidth - 20, footerY + 20, { align: 'right' });
        doc.text("Authorized Signatory", pageWidth - 20, footerY + 40, { align: 'right' });

        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
        console.error("PDF Error", error);
        alert("Failed to generate PDF. check console details.");
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
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
                                    <button
                                        onClick={() => generateEWayBill(item)}
                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Generate E-Way Bill"
                                    >
                                        <Truck size={16} />
                                    </button>
                                    <button
                                        onClick={() => downloadInvoiceAsPDF(item, companyInfo)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
