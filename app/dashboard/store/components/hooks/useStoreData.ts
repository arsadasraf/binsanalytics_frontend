/**
 * useStoreData Custom Hook
 * 
 * Manages all business logic and state for the Store Dashboard.
 * Handles:
 * - State management for forms, data, loading, errors
 * - Data fetching from API (inventory, transactions, master data)
 * - CRUD operations (create, read, update, delete)
 * - Item management for transaction forms
 * - Search filtering
 * 
 * This hook centralizes all business logic, keeping components focused on presentation.
 * 
 * @param activeTab - Current active main tab
 * @param masterTab - Current active master tab
 * @param token - Authentication token
 * @returns Object containing all state and handler functions
 */

import { useState, useEffect, useMemo } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/src/lib/api";
import { TabType, MasterType, FormData, Vendor, Customer, Location, Category, Material, GRNFormData, POFormData } from "../../types/store.types";

export function useStoreData(activeTab: TabType, masterTab: MasterType, token: string | null) {
    // ==================== State Management ====================

    // Data and UI state
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({ items: [] });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);

    // Master data for dropdowns
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);

    // Filter state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterSupplier, setFilterSupplier] = useState("");

    // ==================== Data Fetching ====================

    /**
     * Fetches data based on the active tab and master tab
     * Determines the appropriate API endpoint and updates the data state
     */
    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let endpoint = "";

            // Determine endpoint based on active tab
            switch (activeTab) {
                case "home":
                    endpoint = "/api/store/inventory";
                    break;
                case "material-issue":
                    endpoint = "/api/store/material-issue";
                    break;
                case "grn":
                    endpoint = "/api/store/grn";
                    break;
                case "dc":
                    endpoint = "/api/store/dc";
                    break;
                case "po":
                    endpoint = "/api/store/po";
                    break;
                case "billing":
                    endpoint = "/api/store/invoice";
                    break;
                case "masters":
                    // For masters, endpoint depends on master tab
                    if (masterTab === "vendor") endpoint = "/api/store/vendor";
                    else if (masterTab === "customer") endpoint = "/api/store/customer";
                    else if (masterTab === "location") endpoint = "/api/store/location";
                    else if (masterTab === "category") endpoint = "/api/store/category";
                    else if (masterTab === "material") endpoint = "/api/store/material";
                    else if (masterTab === "grn-history") endpoint = "/api/store/grn";
                    break;
            }

            if (endpoint) {
                const result = await apiGet(endpoint, token);
                // Handle different response structures
                setData(result.data || result[Object.keys(result)[0]] || []);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches master data (vendors, customers, locations, categories, materials) for dropdown selections
     * Runs once on component mount
     */
    const fetchMasters = async () => {
        if (!token) return;
        try {
            const [vendorRes, customerRes, locationRes, categoryRes, materialRes] = await Promise.all([
                apiGet("/api/store/vendor", token).catch(() => ({ data: [] })),
                apiGet("/api/store/customer", token).catch(() => ({ data: [] })),
                apiGet("/api/store/location", token).catch(() => ({ data: [] })),
                apiGet("/api/store/category", token).catch(() => ({ data: [] })),
                apiGet("/api/store/material", token).catch(() => ({ data: [] })),
            ]);

            setVendors(vendorRes.data || vendorRes.vendors || []);
            setCustomers(customerRes.data || customerRes.customers || []);
            setLocations(locationRes.data || locationRes.locations || []);
            setCategories(categoryRes.data || categoryRes.categories || []);
            setMaterials(materialRes.data || materialRes.materials || []);
        } catch (err) {
            console.error("Failed to fetch masters:", err);
        }
    };

    // Fetch data when tab changes or component mounts
    useEffect(() => {
        if (token) {
            fetchData();
            fetchMasters();
        }
    }, [activeTab, masterTab, token]);

    // ==================== Search Filtering ====================

    /**
     * Filters data based on search term and specific filters
     * Searches across different fields depending on the active tab
     */
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // GRN History Filtering
            if (activeTab === "masters" && masterTab === "grn-history") {
                // Date Filter
                if (startDate) {
                    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
                    const start = new Date(startDate).setHours(0, 0, 0, 0);
                    if (itemDate < start) return false;
                }
                if (endDate) {
                    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
                    const end = new Date(endDate).setHours(0, 0, 0, 0);
                    if (itemDate > end) return false;
                }

                // Supplier Filter
                if (filterSupplier) {
                    const itemSupplierId = item.supplier?._id || item.supplier;
                    if (itemSupplierId !== filterSupplier) return false;
                }
            }

            const searchLower = searchTerm.toLowerCase();

            if (activeTab === "masters") {
                // Search in master data fields
                return (
                    (item.name?.toLowerCase().includes(searchLower) || false) ||
                    (item.code?.toLowerCase().includes(searchLower) || false) ||
                    (item.contactPerson?.toLowerCase().includes(searchLower) || false) ||
                    (item.email?.toLowerCase().includes(searchLower) || false) ||
                    (item.grnNumber?.toLowerCase().includes(searchLower) || false) || // GRN Number
                    (item.supplierName?.toLowerCase().includes(searchLower) || false) // Supplier Name
                );
            }

            // Search in transaction/inventory fields
            return (
                (item.materialName?.toLowerCase().includes(searchLower) || false) ||
                (item.number?.toLowerCase().includes(searchLower) || false) ||
                (item.code?.toLowerCase().includes(searchLower) || false)
            );
        });
    }, [data, searchTerm, activeTab, masterTab, startDate, endDate, filterSupplier]);

    // ==================== CRUD Operations ====================

    /**
     * Handles form submission for create/update operations
     * Determines the appropriate endpoint and HTTP method based on context
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        try {
            let endpoint = "";
            const method = editingId ? "PUT" : "POST";

            // Determine endpoint based on active tab and editing state
            if (activeTab === "masters") {
                endpoint = editingId
                    ? `/api/store/${masterTab}/${editingId}`
                    : `/api/store/${masterTab}`;
            } else if (activeTab === "grn") {
                endpoint = editingId ? `/api/store/grn/${editingId}` : "/api/store/grn";
            } else if (activeTab === "dc") {
                endpoint = editingId ? `/api/store/dc/${editingId}` : "/api/store/dc";
            } else if (activeTab === "po") {
                endpoint = editingId ? `/api/store/po/${editingId}` : "/api/store/po";
            } else if (activeTab === "billing") {
                endpoint = editingId ? `/api/store/invoice/${editingId}` : "/api/store/invoice";
            } else if (activeTab === "material-issue") {
                endpoint = editingId ? `/api/store/material-issue/${editingId}` : "/api/store/material-issue";
            }

            // Execute API call
            if (method === "PUT") {
                await apiPut(endpoint, formData, token);
            } else {
                await apiPost(endpoint, formData, token);
            }

            setSuccess(`Record ${editingId ? "updated" : "created"} successfully`);

            // Reset form state
            setShowForm(false);
            setFormData({ items: [] });
            setEditingId(null);
            setPhotos([]);

            // Refresh data
            fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to save record");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles edit action - populates form with existing data
     */
    const handleEdit = (item: any) => {
        // For materials, handle populated categoryId
        const editData = { ...item };
        if (masterTab === "material" && item.categoryId && typeof item.categoryId === 'object') {
            editData.categoryId = item.categoryId._id;
            editData.unit = item.categoryId.unit;
        }

        setFormData(editData);
        setEditingId(item._id);
        setShowForm(true);
    };

    /**
     * Handles delete action with confirmation
     */
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        if (!token) return;

        setLoading(true);
        try {
            let endpoint = "";

            // Determine endpoint based on active tab
            if (activeTab === "masters") {
                if (masterTab === "grn-history") {
                    endpoint = `/api/store/grn/${id}`;
                } else {
                    endpoint = `/api/store/${masterTab}/${id}`;
                }
            } else if (activeTab === "grn") {
                endpoint = `/api/store/grn/${id}`;
            } else if (activeTab === "dc") {
                endpoint = `/api/store/dc/${id}`;
            } else if (activeTab === "po") {
                endpoint = `/api/store/po/${id}`;
            } else if (activeTab === "billing") {
                endpoint = `/api/store/invoice/${id}`;
            } else if (activeTab === "material-issue") {
                endpoint = `/api/store/material-issue/${id}`;
            }

            if (endpoint) {
                await apiDelete(endpoint, token);
                setSuccess("Record deleted successfully");
                fetchData();
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete record");
        } finally {
            setLoading(false);
        }
    };

    // ==================== Item Management ====================

    /**
     * Adds a new item to the items array in form data
     */
    const addItem = () => {
        setFormData({
            ...formData,
            items: [...(formData.items || []), { materialName: "", quantity: "", unit: "PCS" }],
        });
    };

    /**
     * Updates a specific field in an item at the given index
     */
    const updateItem = (idx: number, field: string, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    /**
     * Removes an item from the items array at the given index
     */
    const removeItem = (idx: number) => {
        setFormData({
            ...formData,
            items: (formData.items || []).filter((_: any, i: number) => i !== idx),
        });
    };

    /**
     * Handles cancel action - resets form state
     */
    const handleCancel = () => {
        setShowForm(false);
        setFormData({ items: [] });
        setEditingId(null);
        setPhotos([]);
    };

    // ==================== GRN Operations ====================

    /**
     * Handles GRN creation from modal
     * @param grnData - GRN form data from modal
     */
    const handleGRNSubmit = async (grnData: GRNFormData) => {
        if (!token) return;

        setLoading(true);
        try {
            await apiPost("/api/store/grn", grnData, token);
            setSuccess("GRN created successfully");

            // Refresh inventory data
            fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to create GRN");
            throw err; // Re-throw to let modal handle it
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles GRN update from modal
     * @param id - GRN ID
     * @param grnData - GRN form data from modal
     */
    const handleGRNUpdate = async (id: string, grnData: GRNFormData) => {
        if (!token) return;

        setLoading(true);
        try {
            await apiPut(`/api/store/grn/${id}`, grnData, token);
            setSuccess("GRN updated successfully");

            // Refresh inventory data
            fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to update GRN");
            throw err; // Re-throw to let modal handle it
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles PO submission from modal
     * @param poData - PO form data from modal
     */
    const handlePOSubmit = async (poData: POFormData) => {
        if (!token) return;

        setLoading(true);
        try {
            await apiPost("/api/store/po", poData, token);
            setSuccess("Purchase Order created successfully");

            // Refresh PO data
            fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to create Purchase Order");
            throw err; // Re-throw to let modal handle it
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles PO update from modal
     * @param id - PO ID
     * @param poData - PO form data from modal
     */
    const handlePOUpdate = async (id: string, poData: POFormData) => {
        if (!token) return;

        setLoading(true);
        try {
            await apiPut(`/api/store/po/${id}`, poData, token);
            setSuccess("Purchase Order updated successfully");

            // Refresh PO data
            fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to update Purchase Order");
            throw err; // Re-throw to let modal handle it
        } finally {
            setLoading(false);
        }
    };

    // ==================== Return Hook Interface ====================

    return {
        // State
        data: filteredData,
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

        // State setters
        setShowForm,
        setFormData,
        setError,
        setSuccess,
        setSearchTerm,

        // Handlers
        handleSubmit,
        handleEdit,
        handleDelete,
        handleCancel,
        handleGRNSubmit,
        handleGRNUpdate,
        handlePOSubmit,
        handlePOUpdate,
        addItem,
        updateItem,
        removeItem,
    };
}
