/**
 * GRNModal Component
 * 
 * Modal dialog for creating Goods Receipt Notes (GRN).
 * Features:
 * - Auto-generated GRN number based on date (format: GRN/YYYY/MM/XXX)
 * - Material selection from master data
 * - Auto-filled unit and category from selected material
 * - Vendor, Location selection from master data
 * - Quantity input
 * - Date selection
 * 
 * @param isOpen - Whether the modal is visible
 * @param onClose - Function to close the modal
 * @param onSubmit - Function to handle form submission
 * @param materials - List of materials from master data
 * @param vendors - List of vendors from master data
 * @param locations - List of locations from master data
 * @param categories - List of categories (not used in form, only for reference)
 * @param loading - Loading state during submission
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GRNModalProps, GRNFormData } from '../types/store.types';

export default function GRNModal({
    isOpen,
    onClose,
    onSubmit,
    materials,
    vendors,
    locations,
    categories,
    loading,
}: GRNModalProps) {
    // Initialize form data with default values
    const [formData, setFormData] = useState<GRNFormData>({
        grnNumber: '',
        date: new Date().toISOString().split('T')[0], // Today's date
        material: '',  // Material ID from master
        quantity: 0,
        unit: '',
        supplier: '',
        locationId: '',
        category: '',  // Category name (auto-filled)
    });

    /**
     * Generates GRN number based on current date
     * Format: GRN/YYYY/MM/XXX
     * XXX is a sequential number (001, 002, etc.)
     */
    const generateGRNNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // In a real application, you would fetch the last GRN number from the backend
        // For now, we'll use a random 3-digit number
        // TODO: Replace with actual backend call to get next sequence number
        const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

        return `GRN/${year}/${month}/${sequence}`;
    };

    // Generate GRN number when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                grnNumber: generateGRNNumber(),
            }));
        }
    }, [isOpen]);

    /**
     * Handles material selection
     * Auto-fills the unit and category from selected material
     */
    const handleMaterialChange = (materialId: string) => {
        const selectedMaterial = materials.find(item => item._id === materialId);
        setFormData({
            ...formData,
            material: materialId,
            materialName: selectedMaterial?.name,
            unit: selectedMaterial?.category?.unit || '',
            category: selectedMaterial?.category?.name || '',
        });
    };

    /**
     * Handles form submission
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Don't render if modal is not open
    if (!isOpen) return null;

    return (
        <>
            {/* Modal backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-2xl font-bold text-gray-900">Create GRN</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal body */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* GRN Number - Auto-generated, read-only */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GRN Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.grnNumber}
                                    readOnly
                                    className="input-field bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            {/* Material Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Material *
                                </label>
                                <select
                                    required
                                    value={formData.material}
                                    onChange={(e) => handleMaterialChange(e.target.value)}
                                    className="input-field"
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
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.quantity || ''}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                    className="input-field"
                                    placeholder="Enter quantity"
                                />
                            </div>

                            {/* Unit - Auto-filled from material's category, read-only */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    readOnly
                                    className="input-field bg-gray-100 cursor-not-allowed"
                                    placeholder="Select material first"
                                />
                            </div>

                            {/* Category - Auto-filled from material, read-only */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    readOnly
                                    className="input-field bg-gray-100 cursor-not-allowed"
                                    placeholder="Select material first"
                                />
                            </div>

                            {/* Supplier */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Supplier *
                                </label>
                                <select
                                    required
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select Supplier</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location *
                                </label>
                                <select
                                    required
                                    value={formData.locationId}
                                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                    className="input-field"
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

                        {/* Form actions */}
                        <div className="flex gap-3 mt-6 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create GRN'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
