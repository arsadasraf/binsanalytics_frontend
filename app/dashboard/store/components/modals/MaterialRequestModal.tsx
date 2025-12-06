"use client";

import { useState, useEffect } from "react";
import { Material } from "../../types/store.types";
import { X, Plus, Trash2 } from "lucide-react";

interface MaterialRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    materials: Material[];
    inventoryList?: any[]; // Optional to avoid strict type breaking if not passed immediately
    loading?: boolean;
}

export default function MaterialRequestModal({
    isOpen,
    onClose,
    onSubmit,
    materials = [],
    inventoryList = [],
    loading
}: MaterialRequestModalProps) {
    const [formData, setFormData] = useState({
        requestNumber: "",
        items: [{ material: "", materialName: "", materialCode: "", quantity: 1, unit: "PCS", purpose: "" }]
    });

    const generateRequestNumber = () => {
        const now = new Date();
        const timeStr = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
        return `REQ-${timeStr}`;
    };

    console.log("MaterialRequestModal Debug:", { materialsLen: materials.length, inventoryLen: inventoryList.length });
    // console.log("First Material:", materials[0]);
    // console.log("First Inventory:", inventoryList[0]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                requestNumber: generateRequestNumber(),
                items: [{ material: "", materialName: "", materialCode: "", quantity: 1, unit: "PCS", purpose: "" }]
            });
        }
    }, [isOpen]);

    const handleMaterialChange = (index: number, materialId: string) => {
        const selectedMaterial = materials.find(m => m._id === materialId);
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            material: materialId,
            materialName: selectedMaterial?.name || "",
            materialCode: selectedMaterial?.code || "", // Ensure code is sent
            unit: typeof selectedMaterial?.categoryId === 'object' ? (selectedMaterial.categoryId as any).unit || "PCS" : "PCS",
        };
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { material: "", materialName: "", materialCode: "", quantity: 1, unit: "PCS", purpose: "" }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">New Material Request</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Request Number: {formData.requestNumber} | Inv Loaded: {inventoryList.length}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <details className="mb-4 p-2 bg-yellow-50 text-xs rounded border border-yellow-200">
                        <summary className="cursor-pointer font-medium text-yellow-800">Debug Inventory Data (Click to expand)</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-gray-800">
                            {inventoryList.length > 0
                                ? JSON.stringify(inventoryList[0], null, 2)
                                : "No inventory data loaded"}
                        </pre>
                    </details>

                    {/* Items Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Requested Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
                                        <select
                                            value={item.material}
                                            onChange={(e) => handleMaterialChange(index, e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        >
                                            <option value="">Select Material</option>
                                            {materials.map((m) => {
                                                const stockItem = inventoryList.find((inv: any) =>
                                                    (inv.materialId === m._id) ||
                                                    (inv.materialCode && m.code && inv.materialCode.toString().trim().toLowerCase() === m.code.toString().trim().toLowerCase()) ||
                                                    (inv.materialName && m.name && inv.materialName.toString().trim().toLowerCase() === m.name.toString().trim().toLowerCase())
                                                );
                                                const stock = stockItem ? stockItem.currentStock : 0;
                                                const unit = stockItem?.unit || (m as any).unit || "PCS";

                                                return (
                                                    <option key={m._id} value={m._id}>
                                                        {m.name} ({m.code}) - Stock: {stock} {unit}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            min="0.01"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                                        <input
                                            type="text"
                                            value={item.unit}
                                            readOnly
                                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Purpose/Remarks</label>
                                        <input
                                            type="text"
                                            value={item.purpose}
                                            onChange={(e) => updateItem(index, "purpose", e.target.value)}
                                            placeholder="Why is this needed?"
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 backdrop-blur-md rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(formData)}
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            "Submit Request"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
