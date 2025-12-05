/**
 * StoreForm Component
 * 
 * Main form wrapper that conditionally renders the appropriate form based on the active tab.
 * Handles form submission, cancel actions, and displays submit/cancel buttons.
 * Integrates all specific form components (MasterForm, GRNForm, DCForm, etc.).
 * 
 * @param activeTab - Current active main tab
 * @param masterTab - Current active master tab (if in masters section)
 * @param showForm - Whether to display the form
 * @param formData - Current form data state
 * @param setFormData - Function to update form data
 * @param editingId - ID of item being edited (null for new items)
 * @param loading - Loading state during form submission
 * @param vendors - List of vendors for dropdowns
 * @param customers - List of customers for dropdowns
 * @param onSubmit - Form submission handler
 * @param onCancel - Cancel button handler
 * @param addItem - Function to add item to items array
 * @param updateItem - Function to update item in items array
 * @param removeItem - Function to remove item from items array
 */

import React from 'react';
import { TabType, MasterType, FormData, Vendor, Customer, Category, Location } from '../../types/store.types';
import MasterForm from './MasterForm';
import GRNForm from './GRNForm';
import DCForm from './DCForm';
import POForm from './POForm';
import BillingForm from './BillingForm';
import MaterialIssueForm from './MaterialIssueForm';
import ItemsList from './ItemsList';

interface StoreFormProps {
    activeTab: TabType;
    masterTab: MasterType;
    showForm: boolean;
    formData: FormData;
    setFormData: (data: FormData) => void;
    editingId: string | null;
    loading: boolean;
    vendors: Vendor[];
    customers: Customer[];
    categories: Category[];
    locations: Location[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    addItem: () => void;
    updateItem: (idx: number, field: string, value: any) => void;
    removeItem: (idx: number) => void;
}

export default function StoreForm({
    activeTab,
    masterTab,
    showForm,
    formData,
    setFormData,
    editingId,
    loading,
    vendors,
    customers,
    categories,
    locations,
    onSubmit,
    onCancel,
    addItem,
    updateItem,
    removeItem,
}: StoreFormProps) {
    // Don't render if form is not visible
    if (!showForm) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Form fields grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Render appropriate form based on active tab */}
                    {activeTab === "masters" && (
                        <MasterForm
                            formData={formData}
                            setFormData={setFormData}
                            masterTab={masterTab}
                            categories={categories}
                            locations={locations}
                        />
                    )}

                    {activeTab === "grn" && (
                        <GRNForm formData={formData} setFormData={setFormData} vendors={vendors} />
                    )}

                    {activeTab === "dc" && (
                        <DCForm formData={formData} setFormData={setFormData} customers={customers} />
                    )}

                    {activeTab === "po" && (
                        <POForm formData={formData} setFormData={setFormData} vendors={vendors} />
                    )}

                    {activeTab === "billing" && (
                        <BillingForm formData={formData} setFormData={setFormData} customers={customers} />
                    )}

                    {activeTab === "material-issue" && (
                        <MaterialIssueForm formData={formData} setFormData={setFormData} />
                    )}
                </div>

                {/* Items section for transaction forms (GRN, DC, PO, Billing) */}
                {["grn", "dc", "po", "billing"].includes(activeTab) && (
                    <ItemsList
                        items={formData.items || []}
                        activeTab={activeTab}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        addItem={addItem}
                    />
                )}

                {/* Form action buttons */}
                <div className="flex gap-3 pt-6 border-t">
                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Saving..." : editingId ? "Update" : "Create"}
                    </button>

                    {/* Cancel button */}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
