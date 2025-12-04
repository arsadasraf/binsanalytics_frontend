/**
 * MasterForm Component
 * 
 * Renders form fields for master data (Vendor, Customer, Location, Category, Material).
 * Fields are conditionally displayed based on the master type:
 * - Vendor/Customer: name, code, contact person, phone, email, GST, address
 * - Location: name, code, description
 * - Category: name, code, unit
 * - Material: name, code, category (dropdown), unit (auto-filled from category)
 * 
 * @param formData - Current form data state
 * @param setFormData - Function to update form data
 * @param masterTab - Current master tab type
 * @param categories - List of categories for material form
 */

import React from 'react';
import { FormData, MasterType, Category } from '../../types/store.types';

interface MasterFormProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
    masterTab: MasterType;
    categories?: Category[];
}

export default function MasterForm({ formData, setFormData, masterTab, categories = [] }: MasterFormProps) {
    /**
     * Handles category selection for material
     * Auto-fills unit from selected category
     */
    const handleCategoryChange = (categoryId: string) => {
        const selectedCategory = categories.find(cat => cat._id === categoryId);
        setFormData({
            ...formData,
            categoryId,
            unit: selectedCategory?.unit || '',
        });
    };

    return (
        <>
            {/* Common fields for all master types */}
            <input
                type="text"
                placeholder="Name *"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
            />
            <input
                type="text"
                placeholder="Code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input-field"
            />

            {/* Vendor and Customer specific fields */}
            {(masterTab === "vendor" || masterTab === "customer") && (
                <>
                    <input
                        type="text"
                        placeholder="Contact Person"
                        value={formData.contactPerson || ""}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Phone"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="GST Number"
                        value={formData.gst || ""}
                        onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                        className="input-field"
                    />
                    <textarea
                        placeholder="Address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="input-field sm:col-span-2"
                    />
                </>
            )}

            {/* Location specific field */}
            {masterTab === "location" && (
                <textarea
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field sm:col-span-2"
                />
            )}

            {/* Category specific field */}
            {masterTab === "category" && (
                <input
                    type="text"
                    placeholder="Unit"
                    value={formData.unit || ""}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                />
            )}

            {/* Material specific fields */}
            {masterTab === "material" && (
                <>
                    {/* Category dropdown */}
                    <div>
                        <select
                            required
                            value={formData.categoryId || ""}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select Category *</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Unit - Auto-filled from category, read-only */}
                    <div>
                        <input
                            type="text"
                            placeholder="Unit (auto-filled)"
                            value={formData.unit || ""}
                            readOnly
                            className="input-field bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                </>
            )}
        </>
    );
}
