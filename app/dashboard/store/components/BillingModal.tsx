/**
 * Billing Modal Component
 * Modal form for creating and editing Invoices/Bills
 */

"use client";

import { useState, useEffect } from "react";
import { BillingModalProps, BillingFormData } from "../types/store.types";

export default function BillingModal({
    isOpen,
    onClose,
    onSubmit,
    customers,
    loading,
    initialData,
    isEditing = false,
}: BillingModalProps) {

    const [formData, setFormData] = useState<BillingFormData>({
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        customerAddress: "",
        customerGST: "",
        items: [{ materialName: "", quantity: 1, unit: "PCS", rate: 0, amount: 0 }],
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        status: "Draft",
    });

    const [taxPercentage, setTaxPercentage] = useState(0);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Calculate tax percentage from initial data 
            if (initialData.subtotal > 0 && initialData.taxAmount) {
                setTaxPercentage((initialData.taxAmount / initialData.subtotal) * 100);
            }
        } else {
            // Reset form
            setFormData({
                date: new Date().toISOString().split("T")[0],
                customerName: "",
                customerAddress: "",
                customerGST: "",
                items: [{ materialName: "", quantity: 1, unit: "PCS", rate: 0, amount: 0 }],
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0,
                status: "Draft",
            });
            setTaxPercentage(0);
        }
    }, [initialData, isOpen]);

    // Calculate totals whenever items or tax change
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = (subtotal * taxPercentage) / 100;
        const totalAmount = subtotal + taxAmount;

        setFormData((prev) => ({
            ...prev,
            subtotal,
            taxAmount,
            totalAmount,
        }));
    }, [formData.items, taxPercentage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { materialName: "", quantity: 1, unit: "PCS", rate: 0, amount: 0 }],
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index], [field]: value };

        // Auto-calculate amount when quantity or rate changes
        if (field === "quantity" || field === "rate") {
            item.amount = (item.quantity || 0) * (item.rate || 0);
        }

        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? "Edit" : "Create"} Invoice
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Info and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                            <select
                                required
                                value={formData.customerName}
                                onChange={(e) => {
                                    const customer = customers.find(c => c.name === e.target.value);
                                    setFormData({
                                        ...formData,
                                        customerName: e.target.value,
                                        customerAddress: customer?.billingAddress || customer?.address || "",
                                        customerGST: customer?.gst || "",
                                    });
                                }}
                                className="input-field"
                            >
                                <option value="">Select Customer</option>
                                {customers.map((customer) => (
                                    <option key={customer._id} value={customer.name}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address</label>
                            <input
                                type="text"
                                value={formData.customerAddress}
                                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                                className="input-field"
                                placeholder="Billing address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer GST</label>
                            <input
                                type="text"
                                value={formData.customerGST}
                                onChange={(e) => setFormData({ ...formData, customerGST: e.target.value })}
                                className="input-field"
                                placeholder="GST Number"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">Items *</label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-lg">
                                    <div className="col-span-12 sm:col-span-4">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Material/Service"
                                            value={item.materialName}
                                            onChange={(e) => updateItem(index, "materialName", e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Unit"
                                            value={item.unit}
                                            onChange={(e) => updateItem(index, "unit", e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="Rate"
                                            value={item.rate}
                                            onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value))}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-10 sm:col-span-2">
                                        <input
                                            type="number"
                                            readOnly
                                            placeholder="Amount"
                                            value={item.amount.toFixed(2)}
                                            className="input-field text-sm bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                            <div className="text-2xl font-bold text-gray-900">₹{formData.subtotal.toFixed(2)}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={taxPercentage}
                                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                                className="input-field"
                                placeholder="0"
                            />
                            <div className="text-sm text-gray-500 mt-1">Tax Amount: ₹{formData.taxAmount.toFixed(2)}</div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-indigo-700 mb-1">Total Amount</label>
                            <div className="text-2xl font-bold text-indigo-900">₹{formData.totalAmount.toFixed(2)}</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="input-field"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
