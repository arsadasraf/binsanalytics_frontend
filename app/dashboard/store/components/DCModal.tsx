/**
 * DC Modal Component
 * Modal form for creating and editing Delivery Challans
 */

"use client";

import { useState, useEffect } from "react";
import { DCModalProps, DCFormData } from "../types/store.types";

export default function DCModal({
    isOpen,
    onClose,
    onSubmit,
    customers,
    loading,
    initialData,
    isEditing = false,
}: DCModalProps) {
    const [formData, setFormData] = useState<DCFormData>({
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        customerAddress: "",
        items: [{ materialName: "", quantity: 1, unit: "PCS", description: "" }],
        status: "Draft",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset form
            setFormData({
                date: new Date().toISOString().split("T")[0],
                customerName: "",
                customerAddress: "",
                items: [{ materialName: "", quantity: 1, unit: "PCS", description: "" }],
                status: "Draft",
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { materialName: "", quantity: 1, unit: "PCS", description: "" }],
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? "Edit" : "Create"} Delivery Challan
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
                    {/* Customer and Date */}
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
                                        customerAddress: customer?.address || "",
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address</label>
                        <input
                            type="text"
                            value={formData.customerAddress}
                            onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                            className="input-field"
                            placeholder="Autofill from customer or enter manually"
                        />
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
                                            placeholder="Material Name"
                                            value={item.materialName}
                                            onChange={(e) => updateItem(index, "materialName", e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Quantity"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Unit"
                                            value={item.unit}
                                            onChange={(e) => updateItem(index, "unit", e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div className="col-span-10 sm:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            className="input-field text-sm"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="input-field"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Issued">Issued</option>
                            <option value="Delivered">Delivered</option>
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
                            {loading ? "Saving..." : isEditing ? "Update DC" : "Create DC"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
