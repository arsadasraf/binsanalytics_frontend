/**
 * Store Dashboard Page
 * 
 * Main orchestrator component for the Store Management dashboard.
 * This component has been refactored from a monolithic 851-line file into a clean,
 * modular structure using separate components for better maintainability.
 * 
 * Architecture:
 * - Business logic is handled by the useStoreData custom hook
 * - UI components are separated into dedicated, reusable components
 * - This page only handles component composition and alert management
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import * as XLSX from 'xlsx';

// Import custom types
import { TabType, MasterType, GRNFormData } from "./types/store.types";

// Import custom hook for business logic
import { useStoreData } from "./components/hooks/useStoreData";

// Import UI components
import StoreHeader from "./components/StoreHeader";
import MasterTabs from "./components/MasterTabs";
import SearchBar from "./components/SearchBar";
import StoreForm from "./components/forms/StoreForm";
import StoreTable from "./components/tables/StoreTable";
import GRNModal from "./components/GRNModal";

/**
 * StoreContent Component
 * 
 * Main content component that orchestrates all store dashboard functionality.
 * Uses the useStoreData hook for state management and data operations.
 */
function StoreContent() {
  // Get active tab from URL query parameters
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "home";

  // State for master tab selection (vendor, customer, location, category)
  const [masterTab, setMasterTab] = useState<MasterType>("vendor");

  // State for GRN modal
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [editingGRN, setEditingGRN] = useState<GRNFormData | undefined>(undefined);

  // Get authentication token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Use custom hook to manage all business logic and state
  const {
    data,
    loading,
    showForm,
    formData,
    error,
    success,
    searchTerm,
    editingId,
    vendors,
    customers,
    locations,
    categories,
    materials,
    setShowForm,
    setFormData,
    setError,
    setSuccess,
    setSearchTerm,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancel,
    handleGRNSubmit,
    handleGRNUpdate,
    addItem,
    updateItem,
    removeItem,
  } = useStoreData(activeTab, masterTab, token);

  /**
   * Handles GRN creation/update from modal
   * Closes modal on success
   */
  const onGRNSubmit = async (grnData: GRNFormData) => {
    try {
      if (editingGRN && editingGRN._id) {
        await handleGRNUpdate(editingGRN._id, grnData);
      } else {
        await handleGRNSubmit(grnData);
      }
      setShowGRNModal(false);
      setEditingGRN(undefined);
    } catch (err) {
      // Error is already handled in hook
    }
  };

  /**
   * Handles edit action for masters
   * Intercepts GRN history edit to show GRN modal
   */
  const handleMasterEdit = (item: any) => {
    if (masterTab === "grn-history") {
      // Prepare GRN data for modal
      const grnData: GRNFormData = {
        _id: item._id,
        grnNumber: item.grnNumber,
        date: item.date,
        material: item.items?.[0]?.material?._id || item.items?.[0]?.material || '',
        materialName: item.items?.[0]?.materialName,
        quantity: item.items?.[0]?.quantity,
        unit: item.items?.[0]?.unit,
        supplier: item.supplier?._id || item.supplier || '',
        locationId: '', // Not stored in GRN, user needs to re-select if needed
        category: item.items?.[0]?.material?.category?.name || '',
      };
      setEditingGRN(grnData);
      setShowGRNModal(true);
    } else {
      handleEdit(item);
    }
  };

  /**
   * Downloads inventory data as Excel file
   */
  const downloadInventoryExcel = async () => {
    try {
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Use API base URL with fallback
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Fetch inventory data from API
      const response = await fetch(`${API_BASE_URL}/api/store/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const result = await response.json();
      const inventoryData = result.inventory || [];

      if (inventoryData.length === 0) {
        setError("No inventory data available to export");
        return;
      }

      // Prepare data for Excel
      const excelData = inventoryData.map((item: any) => ({
        'Material Code': item.materialCode || '',
        'Material Name': item.materialName || '',
        'Category': item.categoryId?.name || 'N/A',
        'Unit': item.unit || '',
        'Current Stock': item.currentStock || 0,
        'Location': item.locationId?.name || item.location || 'N/A',
        'Reorder Level': item.reorderLevel || 0,
        'Reorder Quantity': item.reorderQuantity || 0,
        'Unit Price': item.unitPrice || 0,
        'Total Value': (item.currentStock || 0) * (item.unitPrice || 0),
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Material Code
        { wch: 25 }, // Material Name
        { wch: 15 }, // Category
        { wch: 10 }, // Unit
        { wch: 15 }, // Current Stock
        { wch: 20 }, // Location
        { wch: 15 }, // Reorder Level
        { wch: 18 }, // Reorder Quantity
        { wch: 12 }, // Unit Price
        { wch: 15 }, // Total Value
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `Inventory_${dateStr}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      setSuccess("Inventory data exported successfully");
    } catch (err: any) {
      console.error('Error downloading inventory:', err);
      setError(err.message || "Failed to export inventory data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Page header with title and description */}
        <StoreHeader />

        {/* Error and success alert messages */}
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

        {/* Master tabs - only shown when masters tab is active */}
        {activeTab === "masters" && (
          <div className="mb-6">
            <MasterTabs masterTab={masterTab} setMasterTab={setMasterTab} />
          </div>
        )}

        {/* Search bar for filtering data */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Create button for masters tab */}
        {activeTab === "masters" && (
          <div className="mb-6">
            <button
              onClick={() => {
                setFormData({ items: [] });
                setShowForm(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New
            </button>
          </div>
        )}

        {/* Create GRN button and Download Excel button - only shown in home tab */}
        {activeTab === "home" && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setEditingGRN(undefined);
                setShowGRNModal(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create GRN
            </button>

            <button
              onClick={downloadInventoryExcel}
              className="p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              title="Download Inventory Excel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Form for creating/editing records */}
        <StoreForm
          activeTab={activeTab}
          masterTab={masterTab}
          showForm={showForm}
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          loading={loading}
          vendors={vendors}
          customers={customers}
          locations={locations}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
        />

        {/* Table for displaying data */}
        <StoreTable
          activeTab={activeTab}
          masterTab={masterTab}
          data={data}
          loading={loading}
          onEdit={handleMasterEdit}
          onDelete={handleDelete}
        />

        {/* GRN Modal */}
        <GRNModal
          isOpen={showGRNModal}
          onClose={() => {
            setShowGRNModal(false);
            setEditingGRN(undefined);
          }}
          onSubmit={onGRNSubmit}
          materials={materials}
          vendors={vendors}
          locations={locations}
          categories={categories}
          loading={loading}
          initialData={editingGRN}
          isEditing={!!editingGRN}
        />
      </div>

      {/* Global styles for input fields */}
      <style jsx>{`
        :global(.input-field) {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        :global(.input-field:focus) {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}

/**
 * StorePage Component
 * 
 * Main page export with Suspense boundary for loading state.
 * This is the entry point for the /dashboard/store route.
 */
export default function StorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
      <StoreContent />
    </Suspense>
  );
}
