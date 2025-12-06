/**
 * MastersTable Component
 */

import React from 'react';
import { Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import { MasterType } from '../../types/store.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface MastersTableProps {
    data: any[];
    masterTab: MasterType;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

const isWithin12Hours = (createdAt: string | Date): boolean => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 12;
};

const downloadGRNAsPDF = (grn: any) => {
    try {
        console.log('Generating PDF for GRN:', grn);
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Goods Receipt Note', 105, 20, { align: 'center' } as any);

        doc.setFontSize(11);
        doc.text(`GRN Number: ${grn.grnNumber}`, 20, 35);
        doc.text(`Date: ${new Date(grn.date).toLocaleDateString()}`, 20, 42);
        doc.text(`Supplier: ${grn.supplierName || 'N/A'}`, 20, 49);
        doc.text(`Status: ${grn.status}`, 20, 56);

        const tableData = (grn.items || []).map((item: any) => [
            item.materialName || 'N/A',
            String(item.quantity || 0),
            item.unit || 'PCS',
            String(item.acceptedQuantity || item.receivedQuantity || item.quantity || 0),
            String(item.rejectedQuantity || 0),
        ]);

        console.log('Table data prepared:', tableData);

        autoTable(doc, {
            startY: 65,
            head: [['Material', 'Quantity', 'Unit', 'Accepted', 'Rejected']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, finalY + 15, { align: 'center' } as any);

        const filename = `GRN_${grn.grnNumber.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Saving PDF:', filename);
        doc.save(filename);

        console.log('PDF generated successfully');
    } catch (error) {
        console.error('PDF Error:', error);
        console.error('Error details:', (error as any)?.message);
        alert(`PDF Error: ${(error as any)?.message}. Check console.`);
    }
};

const downloadGRNAsExcel = (grn: any) => {
    const grnDetails = [
        ['Goods Receipt Note'],
        [],
        ['GRN Number:', grn.grnNumber],
        ['Date:', new Date(grn.date).toLocaleDateString()],
        ['Supplier:', grn.supplierName || 'N/A'],
        ['Status:', grn.status],
        [],
        ['Material', 'Quantity', 'Unit', 'Accepted Qty', 'Rejected Qty'],
    ];

    (grn.items || []).forEach((item: any) => {
        grnDetails.push([
            item.materialName || 'N/A',
            item.quantity || 0,
            item.unit || 'PCS',
            item.acceptedQuantity || item.receivedQuantity || item.quantity || 0,
            item.rejectedQuantity || 0,
        ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(grnDetails);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GRN');
    XLSX.writeFile(workbook, `GRN_${grn.grnNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
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

        console.log('Table data prepared:', tableData);

        autoTable(doc, {
            startY: 65,
            head: [['Material', 'Quantity', 'Unit', 'Rate (₹)', 'Amount (₹)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [147, 51, 234] }, // Purple for PO
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(11);
        doc.text(`Total Amount: ₹ ${(po.totalAmount || po.amount || 0).toFixed(2)}`, 20, finalY + 10);

        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, finalY + 20, { align: 'center' } as any);

        const filename = `PO_${po.poNumber.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Saving PDF:', filename);
        doc.save(filename);

        console.log('PDF generated successfully');
    } catch (error) {
        console.error('PDF Error:', error);
        console.error('Error details:', (error as any)?.message);
        alert(`PDF Error: ${(error as any)?.message}. Check console.`);
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

    // Handle both single material and items array
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

export default function MastersTable({ data, masterTab, onEdit, onDelete }: MastersTableProps) {
    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {masterTab !== "grn-history" && masterTab !== "po-history" && (<><th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Code</th></>)}
                            {masterTab === "grn-history" && (<><th className="px-6 py-3 text-left font-semibold text-gray-900">GRN Number</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Supplier</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Material</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Quantity</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th></>)}
                            {masterTab === "po-history" && (<><th className="px-6 py-3 text-left font-semibold text-gray-900">PO Number</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Vendor</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Material</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Amount (₹)</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th></>)}
                            {(masterTab === "vendor" || masterTab === "customer") && (<><th className="px-6 py-3 text-left font-semibold text-gray-900">Contact</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th></>)}
                            {masterTab === "material" && (<><th className="px-6 py-3 text-left font-semibold text-gray-900">Category</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Unit</th><th className="px-6 py-3 text-left font-semibold text-gray-900">Location</th></>)}
                            <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                {masterTab === "grn-history" && (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.grnNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.supplierName}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.items?.[0]?.materialName || '-'}{item.items?.length > 1 && <span className="text-xs text-gray-500 ml-1">(+{item.items.length - 1} more)</span>}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.items?.[0]?.quantity} {item.items?.[0]?.unit}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Received' ? 'bg-green-100 text-green-800' : item.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span></td>
                                    </>
                                )}
                                {masterTab === "po-history" && (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.poNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.vendorName || item.vendor?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{(item.items && item.items.length > 0 ? item.items[0]?.materialName : item.materialName) || '-'}{item.items?.length > 1 && <span className="text-xs text-gray-500 ml-1">(+{item.items.length - 1} more)</span>}</td>
                                        <td className="px-6 py-4 text-gray-600 font-semibold">₹ {(item.totalAmount || item.amount || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Released' ? 'bg-purple-100 text-purple-800' : item.status === 'Completed' ? 'bg-green-100 text-green-800' : item.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span></td>
                                    </>
                                )}
                                {masterTab !== "grn-history" && masterTab !== "po-history" && (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.code}</td>
                                        {(masterTab === "vendor" || masterTab === "customer") && (<><td className="px-6 py-4 text-gray-600">{item.contactPerson}</td><td className="px-6 py-4 text-gray-600">{item.email}</td></>)}
                                        {masterTab === "material" && (<><td className="px-6 py-4 text-gray-600">{item.categoryId?.name || item.category?.name || '-'}</td><td className="px-6 py-4 text-gray-600">{item.categoryId?.unit || item.category?.unit || '-'}</td><td className="px-6 py-4 text-gray-600">{item.locationId?.name || item.location?.name || '-'}</td></>)}
                                    </>
                                )}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {masterTab === "grn-history" ? (
                                            <>
                                                <button onClick={() => downloadGRNAsPDF(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF"><Download size={16} /></button>
                                                <button onClick={() => downloadGRNAsExcel(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Excel"><FileSpreadsheet size={16} /></button>
                                                {isWithin12Hours(item.createdAt || item.date) ? (
                                                    <>
                                                        <button onClick={() => onEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit GRN"><Edit2 size={16} /></button>
                                                        <button onClick={() => onDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete GRN"><Trash2 size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button disabled className="p-2 text-gray-400 cursor-not-allowed rounded-lg" title="Cannot edit: 12-hour limit exceeded"><Edit2 size={16} /></button>
                                                        <button disabled className="p-2 text-gray-400 cursor-not-allowed rounded-lg" title="Cannot delete: 12-hour limit exceeded"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </>
                                        ) : masterTab === "po-history" ? (
                                            <>
                                                <button onClick={() => downloadPOAsPDF(item)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Download PDF"><Download size={16} /></button>
                                                <button onClick={() => downloadPOAsExcel(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Excel"><FileSpreadsheet size={16} /></button>
                                                {isWithin12Hours(item.createdAt || item.date) ? (
                                                    <>
                                                        <button onClick={() => onEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit PO"><Edit2 size={16} /></button>
                                                        <button onClick={() => onDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete PO"><Trash2 size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button disabled className="p-2 text-gray-400 cursor-not-allowed rounded-lg" title="Cannot edit: 12-hour limit exceeded"><Edit2 size={16} /></button>
                                                        <button disabled className="p-2 text-gray-400 cursor-not-allowed rounded-lg" title="Cannot delete: 12-hour limit exceeded"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => onEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => onDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                                            </>
                                        )}
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
                                {masterTab === "grn-history" ? (
                                    <>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">GRN #{item.grnNumber}</span>
                                        <h4 className="font-bold text-gray-900">{item.supplierName}</h4>
                                    </>
                                ) : masterTab === "po-history" ? (
                                    <>
                                        <span className="text-xs font-medium text-gray-500 block mb-1">PO #{item.poNumber}</span>
                                        <h4 className="font-bold text-gray-900">{item.vendorName || item.vendor?.name || 'Unknown Vendor'}</h4>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <span className="text-xs text-gray-500">{item.code}</span>
                                    </>
                                )}
                            </div>

                            {/* Status Badges for History Tabs */}
                            {masterTab === "grn-history" && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Received' ? 'bg-green-100 text-green-800' : item.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
                            )}
                            {masterTab === "po-history" && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Released' ? 'bg-purple-100 text-purple-800' : item.status === 'Completed' ? 'bg-green-100 text-green-800' : item.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
                            )}
                        </div>

                        {/* Card Content Details */}
                        <div className="text-sm space-y-2">
                            {(masterTab === "vendor" || masterTab === "customer") && (
                                <>
                                    <div className="flex justify-between"><span className="text-gray-500">Contact:</span> <span className="font-medium">{item.contactPerson || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{item.email || '-'}</span></div>
                                </>
                            )}

                            {masterTab === "material" && (
                                <>
                                    <div className="flex justify-between"><span className="text-gray-500">Category:</span> <span className="font-medium">{item.categoryId?.name || item.category?.name || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-medium">{item.locationId?.name || item.location?.name || '-'}</span></div>
                                </>
                            )}

                            {masterTab === "grn-history" && (
                                <>
                                    <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Items:</span> <span>{item.items?.length || 0}</span></div>
                                </>
                            )}

                            {masterTab === "po-history" && (
                                <>
                                    <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span className="font-bold">₹ {(item.totalAmount || item.amount || 0).toFixed(2)}</span></div>
                                </>
                            )}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-1">
                            {masterTab === "grn-history" ? (
                                <div className="flex w-full gap-2">
                                    <button onClick={() => downloadGRNAsPDF(item)} className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Download size={14} /> PDF</button>
                                    {isWithin12Hours(item.createdAt || item.date) && (
                                        <button onClick={() => onDelete(item._id)} className="flex-none p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ) : masterTab === "po-history" ? (
                                <div className="flex w-full gap-2">
                                    <button onClick={() => downloadPOAsPDF(item)} className="flex-1 py-2 text-purple-600 bg-purple-50 rounded-lg text-xs font-medium flex justify-center items-center gap-1"><Download size={14} /> PDF</button>
                                    {isWithin12Hours(item.createdAt || item.date) && (
                                        <button onClick={() => onDelete(item._id)} className="flex-none p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => onEdit(item)} className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"><Edit2 size={16} /> Edit</button>
                                    <button onClick={() => onDelete(item._id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"><Trash2 size={16} /> Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
