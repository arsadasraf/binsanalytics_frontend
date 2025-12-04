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

// Import custom types
import { TabType, MasterType } from "./types/store.types";

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
    addItem,
    updateItem,
    removeItem,
  } = useStoreData(activeTab, masterTab, token);

  /**
   * Handles GRN creation from modal
   * Closes modal on success
   */
  const onGRNSubmit = async (grnData: any) => {
    try {
      await handleGRNSubmit(grnData);
      setShowGRNModal(false);
    } catch (err) {
      // Error is already handled in handleGRNSubmit
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

        {/* Create GRN button - only shown in home tab */}
        {activeTab === "home" && (
          <div className="mb-6">
            <button
              onClick={() => setShowGRNModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create GRN
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* GRN Modal */}
        <GRNModal
          isOpen={showGRNModal}
          onClose={() => setShowGRNModal(false)}
          onSubmit={onGRNSubmit}
          materials={materials}
          vendors={vendors}
          locations={locations}
          categories={categories}
          loading={loading}
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

