"use client";

import { useState, useEffect } from "react";
import { useStoreData } from "../../store/components/hooks/useStoreData";
import StoreTable from "../../store/components/tables/StoreTable";
import StoreForm from "../../store/components/forms/StoreForm";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { MasterType } from "../../store/types/store.types";

interface PPCMasterTabProps {
    subTab: "machine-list" | "material" | "customer" | "supplier";
}

export default function PPCMasterTab({ subTab }: PPCMasterTabProps) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Machine List State
    const [machines, setMachines] = useState<any[]>([]);
    const [loadingMachines, setLoadingMachines] = useState(false);

    // Determine Store Master Tab mapping
    const storeMasterTab: MasterType =
        subTab === "material" ? "material" :
            subTab === "customer" ? "customer" :
                subTab === "supplier" ? "vendor" : "material"; // fallback

    // Use Store Data Hook
    // We always call it, but its effects depend on the props passed
    const {
        data: storeData,
        loading: loadingStore,
        showForm,
        formData,
        setShowForm,
        setFormData,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleCancel,
        addItem,
        updateItem,
        removeItem,
        vendors,
        customers,
        locations,
        categories,
        editingId,
        error: storeError,
        success: storeSuccess,
        setError: setStoreError,
        setSuccess: setStoreSuccess
    } = useStoreData("masters", storeMasterTab, token);

    // Fetch Machines if subTab is machine-list
    useEffect(() => {
        if (subTab === "machine-list" && token) {
            fetchMachines();
        }
    }, [subTab, token]);

    const fetchMachines = async () => {
        setLoadingMachines(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        try {
            const res = await fetch(`${API_BASE_URL}/api/ppc/machine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMachines(data.machines || []);
        } catch (error) {
            console.error("Error fetching machines:", error);
        } finally {
            setLoadingMachines(false);
        }
    };

    // Render Machine List
    const renderMachineList = () => {
        if (loadingMachines) return <LoadingSpinner />;

        if (machines.length === 0) {
            return <div className="text-center py-8 text-gray-500">No machines found</div>;
        }

        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {machines.map((machine) => (
                            <tr key={machine._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.machineName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.machineCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.machineType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${machine.status === 'Available' ? 'bg-green-100 text-green-800' :
                                        machine.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {machine.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.hourlyRate || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Main Render
    return (
        <div>
            {/* Store Form Modal */}
            <StoreForm
                activeTab="masters"
                masterTab={storeMasterTab}
                showForm={showForm}
                formData={formData}
                setFormData={setFormData}
                editingId={editingId}
                loading={loadingStore}
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

            {/* Content */}
            <div className="mt-4">
                {subTab === "machine-list" ? (
                    renderMachineList()
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setFormData({ items: [] });
                                    setShowForm(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Add {subTab === 'supplier' ? 'Supplier' : subTab === 'customer' ? 'Customer' : 'Material'}
                            </button>
                        </div>
                        <StoreTable
                            activeTab="masters"
                            masterTab={storeMasterTab}
                            data={storeData}
                            loading={loadingStore}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
