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
import { StoreFormData, MasterType, Category, Location } from '../../types/store.types';

interface MasterFormProps {
    formData: StoreFormData;
    setFormData: (data: StoreFormData) => void;
    masterTab: MasterType;
    categories?: Category[];
    locations?: Location[];
}

export default function MasterForm({ formData, setFormData, masterTab, categories = [], locations = [] }: MasterFormProps) {
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

                    {/* Address fields - different for vendor vs customer */}
                    {masterTab === "vendor" && (
                        <textarea
                            placeholder="Address"
                            value={formData.address || ""}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="input-field sm:col-span-2"
                        />
                    )}

                    {masterTab === "customer" && (
                        <>
                            <textarea
                                placeholder="Billing Address"
                                value={formData.billingAddress || ""}
                                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                className="input-field"
                            />
                            <textarea
                                placeholder="Shipping Address"
                                value={formData.shippingAddress || ""}
                                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                className="input-field"
                            />
                        </>
                    )}

                    {/* Bank Details Section */}
                    <div className="sm:col-span-2 border-t pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={formData.bankDetails?.accountNumber || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    bankDetails: {
                                        ...formData.bankDetails,
                                        accountNumber: e.target.value
                                    }
                                })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="IFSC Code"
                                value={formData.bankDetails?.ifscCode || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    bankDetails: {
                                        ...formData.bankDetails,
                                        ifscCode: e.target.value
                                    }
                                })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={formData.bankDetails?.bankName || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    bankDetails: {
                                        ...formData.bankDetails,
                                        bankName: e.target.value
                                    }
                                })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="Branch Name"
                                value={formData.bankDetails?.branchName || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    bankDetails: {
                                        ...formData.bankDetails,
                                        branchName: e.target.value
                                    }
                                })}
                                className="input-field"
                            />
                        </div>
                    </div>
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

                    {/* Location dropdown */}
                    <div>
                        <select
                            value={formData.locationId || ""}
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
