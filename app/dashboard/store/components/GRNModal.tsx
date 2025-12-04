/**
 * GRNModal Component - Enhanced Version
 * 
 * Modal dialog for creating/editing Goods Receipt Notes (GRN).
 * Features:
 * - Auto-generated GRN number based on date and time
 * - Supplier selection with searchable dropdown
 * - Multiple material entries support
 * - Auto-filled unit and category from selected material
 * - Location selection from master data
 * - Improved UI/UX with clear visual hierarchy
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GRNModalProps, Material } from '../types/store.types';

interface MaterialEntry {
    material: string;
    materialName: string;
    quantity: number;
    unit: string;
    category: string;
    locationId: string;
}

export default function GRNModal({
    isOpen,
    onClose,
    onSubmit,
    materials,
    vendors,
    locations,
    loading,
    initialData,
    isEditing = false,
}: GRNModalProps) {
    // Form state
    const [grnNumber, setGrnNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [supplier, setSupplier] = useState('');
    const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([{
        material: '',
        materialName: '',
        quantity: 0,
        unit: '',
        category: '',
        locationId: '',
    }]);

    /**
     * Generates GRN number based on current date and time
     * Format: GRN/YYYYMMDD-HHMMSS
     */
    const generateGRNNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `GRN/${year}${month}${day}-${hours}${minutes}${seconds}`;
    };

    // Initialize form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setGrnNumber(initialData.grnNumber || '');
                setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
                setSupplier(initialData.supplier || '');
                setMaterialEntries([{
                    material: initialData.material || '',
                    materialName: initialData.materialName || '',
                    quantity: initialData.quantity || 0,
                    unit: initialData.unit || '',
                    category: initialData.category || '',
                    locationId: initialData.locationId || '',
                }]);
            } else {
                setGrnNumber(generateGRNNumber());
                setDate(new Date().toISOString().split('T')[0]);
                setSupplier('');
                setMaterialEntries([{
                    material: '',
                    materialName: '',
                    quantity: 0,
                    unit: '',
                    category: '',
                    locationId: '',
                }]);
            }
        }
    }, [isOpen, isEditing, initialData]);

    /**
     * Handles material selection for a specific entry
     */
    const handleMaterialChange = (index: number, materialId: string) => {
        const selectedMaterial = materials.find(item => item._id === materialId);
        const newEntries = [...materialEntries];
        newEntries[index] = {
            ...newEntries[index],
            material: materialId,
            materialName: selectedMaterial?.name || '',
            unit: getCategoryUnit(selectedMaterial) || '',
            category: getCategoryName(selectedMaterial) || '',
        };
        setMaterialEntries(newEntries);
    };

    /**
     * Helper function to get category unit from material
     */
    const getCategoryUnit = (material: Material | undefined): string => {
        if (!material) return '';
        if (typeof material.categoryId === 'object' && material.categoryId.unit) {
            return material.categoryId.unit;
        }
        return material.category?.unit || '';
    };

    /**
     * Helper function to get category name from material
     */
    const getCategoryName = (material: Material | undefined): string => {
        if (!material) return '';
        if (typeof material.categoryId === 'object' && material.categoryId.name) {
            return material.categoryId.name;
        }
        return material.category?.name || '';
    };

    /**
     * Updates a field in a specific material entry
     */
    const updateEntry = (index: number, field: keyof MaterialEntry, value: any) => {
        const newEntries = [...materialEntries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setMaterialEntries(newEntries);
    };

    /**
     * Adds a new material entry
     */
    const addMaterialEntry = () => {
        setMaterialEntries([...materialEntries, {
            material: '',
            materialName: '',
            quantity: 0,
            unit: '',
            category: '',
            locationId: '',
        }]);
    };

    /**
     * Removes a material entry
     */
    const removeMaterialEntry = (index: number) => {
        if (materialEntries.length > 1) {
            setMaterialEntries(materialEntries.filter((_, i) => i !== index));
        }
    };

    /**
     * Handles form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare items array with all material entries
        const items = materialEntries.map(entry => ({
            material: entry.material,
            materialName: entry.materialName,
            quantity: entry.quantity,
            unit: entry.unit,
            locationId: entry.locationId,
        }));

        // Send GRN data with items array
        onSubmit({
            grnNumber,
            date,
            supplier,
            items,  // Send as items array
            // For backward compatibility, also send first item as single fields
            material: materialEntries[0]?.material || '',
            materialName: materialEntries[0]?.materialName || '',
            quantity: materialEntries[0]?.quantity || 0,
            unit: materialEntries[0]?.unit || '',
            locationId: materialEntries[0]?.locationId || '',
            category: materialEntries[0]?.category || '',
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Modal backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {isEditing ? 'Edit GRN' : 'Create Goods Receipt Note'}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Add materials received from supplier
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal body - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="grn-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* GRN Details Section */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-indigo-600 rounded"></div>
                                    GRN Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* GRN Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GRN Number
                                        </label>
                                        <input
                                            type="text"
                                            value={grnNumber}
                                            readOnly
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Supplier */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Supplier <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={supplier}
                                            onChange={(e) => setSupplier(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select Supplier</option>
                                            {vendors.map((vendor) => (
                                                <option key={vendor._id} value={vendor._id}>
                                                    {vendor.name} {vendor.code ? `(${vendor.code})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div className="bg-white rounded-xl border-2 border-indigo-100">
                                <div className="p-5 border-b border-indigo-100 bg-indigo-50 rounded-t-xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <div className="w-1 h-5 bg-indigo-600 rounded"></div>
                                            Material Entries
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addMaterialEntry}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Plus size={16} />
                                            Add Material
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {materialEntries.map((entry, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
                                            {/* Entry number badge */}
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>

                                            {/* Delete button */}
                                            {materialEntries.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterialEntry(index)}
                                                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                                {/* Material */}
                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Material <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={entry.material}
                                                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Select Material</option>
                                                        {materials.map((item) => (
                                                            <option key={item._id} value={item._id}>
                                                                {item.name} ({item.code || 'N/A'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Quantity */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Quantity <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={entry.quantity || ''}
                                                        onChange={(e) => updateEntry(index, 'quantity', parseFloat(e.target.value))}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="0"
                                                    />
                                                </div>

                                                {/* Category - Read-only */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={entry.category}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                                                        placeholder="Auto-filled"
                                                    />
                                                </div>

                                                {/* Unit - Read-only */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unit
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={entry.unit}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                                                        placeholder="Auto-filled"
                                                    />
                                                </div>

                                                {/* Location */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Location <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={entry.locationId}
                                                        onChange={(e) => updateEntry(index, 'locationId', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Select Location</option>
                                                        {locations.map((location) => (
                                                            <option key={location._id} value={location._id}>
                                                                {location.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {materialEntries.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No materials added. Click "Add Material" to start.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Modal footer - Fixed at bottom */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                form="grn-form"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? 'Saving...' : isEditing ? 'Update GRN' : 'Create GRN'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors border-2 border-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
