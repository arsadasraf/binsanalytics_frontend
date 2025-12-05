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
import { TabType, MasterType, GRNFormData, POFormData, DCFormData, BillingFormData } from "./types/store.types";

// Import custom hook for business logic
import { useStoreData } from "./components/hooks/useStoreData";

// Import UI components
import StoreHeader from "./components/StoreHeader";
import MasterTabs from "./components/MasterTabs";
import BillsTabs from "./components/BillsTabs";
import SearchBar from "./components/SearchBar";
import StoreForm from "./components/forms/StoreForm";
import StoreTable from "./components/tables/StoreTable";
import POTable from "./components/tables/POTable";
import GRNModal from "./components/GRNModal";
import POModal from "./components/POModal";
import DCModal from "./components/DCModal";
import BillingModal from "./components/BillingModal";
import CompanyInfoForm from "./components/forms/CompanyInfoForm";
import DCTable from "./components/tables/DCTable";
import BillingTable from "./components/tables/BillingTable";
import MaterialIssueTab from "./components/MaterialIssueTab";
import StoreTabs from "./components/StoreTabs";

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

  // State for PO modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState<POFormData | undefined>(undefined);

  // State for DC modal
  const [showDCModal, setShowDCModal] = useState(false);
  const [editingDC, setEditingDC] = useState<DCFormData | undefined>(undefined);

  // State for Billing modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [editingBilling, setEditingBilling] = useState<BillingFormData | undefined>(undefined);

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
    handlePOSubmit,
    handlePOUpdate,
    handleDCSubmit,
    handleDCUpdate,
    handleBillingSubmit,
    handleBillingUpdate,
    addItem,
    updateItem,
    removeItem,
    companyInfo,
    saveCompanyInfo,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    materialRequests,
    createMaterialRequest,
    updateMaterialRequest,
    createMaterialIssue,
    updateMaterialIssue,
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
   * Handles PO creation/update from modal
   * Closes modal on success
   */
  const onPOSubmit = async (poData: POFormData) => {
    try {
      if (editingPO && editingPO._id) {
        await handlePOUpdate(editingPO._id, poData);
      } else {
        await handlePOSubmit(poData);
      }
      setShowPOModal(false);
      setEditingPO(undefined);
    } catch (err) {
      // Error is already handled in hook
    }
  };

  /**
   * Handles DC creation/update from modal
   */
  const onDCSubmit = async (dcData: DCFormData) => {
    try {
      if (editingDC && editingDC._id) {
        await handleDCUpdate(editingDC._id, dcData);
      } else {
        await handleDCSubmit(dcData);
      }
      setShowDCModal(false);
      setEditingDC(undefined);
    } catch (err) {
      // Error is already handled in hook
    }
  };

  /**
   * Handles Billing/Invoice creation/update from modal
   */
  const onBillingSubmit = async (billingData: BillingFormData) => {
    try {
      if (editingBilling && editingBilling._id) {
        await handleBillingUpdate(editingBilling._id, billingData);
      } else {
        await handleBillingSubmit(billingData);
      }
      setShowBillingModal(false);
      setEditingBilling(undefined);
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
   * Handles PO edit action
   * Opens PO modal with prepopulated data
   */
  const handlePOEdit = (item: any) => {
    const poData: POFormData = {
      _id: item._id,
      poNumber: item.poNumber,
      date: item.date,
      vendor: item.vendor?._id || item.vendor || '',
      material: item.material || (item.items && item.items.length > 0 ? item.items[0]?.material : ''),
      materialName: item.materialName || (item.items && item.items.length > 0 ? item.items[0]?.materialName : ''),
      quantity: item.quantity || (item.items && item.items.length > 0 ? item.items[0]?.quantity : 0),
      unit: item.unit || (item.items && item.items.length > 0 ? item.items[0]?.unit : ''),
      rate: item.rate || (item.items && item.items.length > 0 ? item.items[0]?.rate : 0),
      amount: item.amount || (item.items && item.items.length > 0 ? item.items[0]?.amount : 0),
      category: item.category || '',
    };
    setEditingPO(poData);
    setShowPOModal(true);
  };

  /**
   * Handles DC edit action
   */
  const handleDCEdit = (item: any) => {
    const dcData: DCFormData = {
      ...item,
      customer: item.customer?._id || item.customer, // Flatten populated customer
      customerName: item.customerName || item.customer?.name,
      items: item.items?.map((i: any) => ({
        ...i,
        material: i.material?._id || i.material, // Flatten populated material
        materialName: i.materialName || i.material?.name
      })) || [],
    };
    setEditingDC(dcData);
    setShowDCModal(true);
  };

  /**
   * Handles Billing edit action
   */
  const handleBillingEdit = (item: any) => {
    const billingData: BillingFormData = {
      ...item,
      customer: item.customer?._id || item.customer, // Flatten populated customer
      customerName: item.customerName || item.customer?.name,
      items: item.items?.map((i: any) => ({
        ...i,
        material: i.material?._id || i.material, // Flatten populated material
        materialName: i.materialName || i.material?.name
      })) || [],
      subtotal: Number(item.subtotal) || 0,
      taxAmount: Number(item.taxAmount) || 0,
      totalAmount: Number(item.totalAmount) || 0,
    };
    setEditingBilling(billingData);
    setShowBillingModal(true);
  };

  /**
   * Downloads DC data as Excel file
   */
  const downloadDCExcel = () => {
    // Filter data for DCs only (should be done by useStoreData but safe to rely on `data` prop passed if activeTab is DC)
    if (!data || data.length === 0) {
      setError("No Delivery Challan data to export");
      return;
    }

    const excelData = data.map((item: any) => ({
      'DC Number': item.dcNumber,
      'Date': new Date(item.date).toLocaleDateString(),
      'Customer': item.customerName,
      'Status': item.status,
      'Items Count': item.items?.length || 0,
      'Remarks': item.otherDetails || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivery Challans');
    XLSX.writeFile(workbook, `DC_History_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Downloads Billing data as Excel file
   */
  const downloadBillingExcel = () => {
    if (!data || data.length === 0) {
      setError("No Invoice data to export");
      return;
    }

    const excelData = data.map((item: any) => ({
      'Invoice Number': item.invoiceNumber,
      'Date': new Date(item.date).toLocaleDateString(),
      'Customer': item.customerName,
      'Subtotal': item.subtotal,
      'Tax': item.taxAmount,
      'Total Amount': item.totalAmount,
      'Status': item.status,
      'Items Count': item.items?.length || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    XLSX.writeFile(workbook, `Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
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

        {/* Main Navigation Tabs */}
        <StoreTabs activeTab={activeTab} />

        {/* Master tabs - only shown when masters tab is active */}
        {activeTab === "masters" && (
          <div className="mb-6">
            <MasterTabs masterTab={masterTab} setMasterTab={setMasterTab} />
          </div>
        )}

        {/* Bills tabs - shown when po, dc, or billing tabs are active */}
        {/* Bills tabs - shown when po, dc, or billing tabs are active */}
        {(activeTab === "po" || activeTab === "dc" || activeTab === "billing") && (
          <div className="mb-6">
            <BillsTabs activeTab={activeTab} />
          </div>
        )}

        {/* Toolbar: Search, Filters, Actions */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          {/* Left Side: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="w-full sm:w-64">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            {/* Date Filter */}
            {(activeTab === "dc" || activeTab === "billing" || activeTab === "po" || activeTab === "grn") && (
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-transparent border-none focus:ring-0 text-sm text-gray-700 w-32 placeholder-gray-400"
                    placeholder="Start Date"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 bg-transparent border-none focus:ring-0 text-sm text-gray-700 w-32"
                    placeholder="End Date"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors mr-1"
                    title="Clear Dates"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Actions (Create & Download) */}
          <div className="flex gap-3 w-full lg:w-auto justify-end">
            {/* DC Buttons */}
            {activeTab === "dc" && (
              <>
                <button
                  onClick={downloadDCExcel}
                  className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  title="Download List as Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditingDC(undefined);
                    setShowDCModal(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-shadow shadow-sm shadow-blue-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create DC
                </button>
              </>
            )}

            {/* Billing Buttons */}
            {activeTab === "billing" && (
              <>
                <button
                  onClick={downloadBillingExcel}
                  className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  title="Download List as Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditingBilling(undefined);
                    setShowBillingModal(true);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm shadow-indigo-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Invoice
                </button>
              </>
            )}

            {/* PO Button */}
            {activeTab === "po" && (
              <button
                onClick={() => {
                  setEditingPO(undefined);
                  setShowPOModal(true);
                }}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-shadow shadow-sm shadow-purple-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create PO
              </button>
            )}

            {/* GRN Buttons */}
            {activeTab === "home" && (
              <>
                <button
                  onClick={() => {
                    setEditingGRN(undefined);
                    setShowGRNModal(true);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm shadow-indigo-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create GRN
                </button>
                <button
                  onClick={downloadInventoryExcel}
                  className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                  title="Download Inventory Excel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}

            {/* Masters Button */}
            {activeTab === "masters" && (
              <button
                onClick={() => {
                  setFormData({ items: [] });
                  setShowForm(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-sm shadow-indigo-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New
              </button>
            )}
          </div>
        </div>

        {/* Store Form */}
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
        {activeTab === "po" ? (
          <POTable
            data={data}
            companyInfo={companyInfo}
            onEdit={handlePOEdit}
            onDelete={handleDelete}
          />
        ) : activeTab === "dc" ? (
          <DCTable
            data={data}
            companyInfo={companyInfo}
            onEdit={handleDCEdit}
            onDelete={handleDelete}
          />
        ) : activeTab === "billing" ? (
          <BillingTable
            data={data}
            companyInfo={companyInfo}
            onEdit={handleBillingEdit}
            onDelete={handleDelete}
          />
        ) : activeTab === "masters" && masterTab === "company-info" ? (
          <CompanyInfoForm
            initialData={companyInfo}
            onSubmit={saveCompanyInfo}
            loading={loading}
          />
        ) : activeTab === "material-issue" ? (
          <MaterialIssueTab storeData={{
            data,
            materialRequests,
            createMaterialRequest,
            updateMaterialRequest,
            createMaterialIssue,
            updateMaterialIssue,
            materials,
            loading,
          }} token={token} />
        ) : (
          <StoreTable
            activeTab={activeTab}
            masterTab={masterTab}
            data={data}
            loading={loading}
            onEdit={handleMasterEdit}
            onDelete={handleDelete}
          />
        )}

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

        {/* PO Modal */}
        <POModal
          isOpen={showPOModal}
          onClose={() => {
            setShowPOModal(false);
            setEditingPO(undefined);
          }}
          onSubmit={onPOSubmit}
          materials={materials}
          vendors={vendors}
          loading={loading}
          initialData={editingPO}
          isEditing={!!editingPO}
        />

        {/* DC Modal */}
        <DCModal
          isOpen={showDCModal}
          onClose={() => {
            setShowDCModal(false);
            setEditingDC(undefined);
          }}
          onSubmit={onDCSubmit}
          customers={customers}
          materials={materials}
          loading={loading}
          initialData={editingDC}
          isEditing={!!editingDC}
        />

        {/* Billing Modal */}
        <BillingModal
          isOpen={showBillingModal}
          onClose={() => {
            setShowBillingModal(false);
            setEditingBilling(undefined);
          }}
          onSubmit={onBillingSubmit}
          customers={customers}
          materials={materials}
          loading={loading}
          initialData={editingBilling}
          isEditing={!!editingBilling}
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
