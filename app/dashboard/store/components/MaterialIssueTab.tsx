import React, { useState } from 'react';
import { Plus, CheckSquare, History, FileText } from 'lucide-react';
import MaterialRequestTable from './tables/MaterialRequestTable';
import MaterialIssueHistoryTable from './tables/MaterialIssueHistoryTable';
import MaterialRequestModal from './modals/MaterialRequestModal';
import { useStoreData } from './hooks/useStoreData';

interface MaterialIssueTabProps {
    storeData: any; // Return value of useStoreData
    token: string | null;
}

export default function MaterialIssueTab({ storeData, token }: MaterialIssueTabProps) {
    const [subTab, setSubTab] = useState<'requests' | 'history'>('requests');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Destructure needed data and handlers
    const {
        materialRequests, // Pending Requests
        data: issueHistory, // Material Issues (mapped to 'data' by useStoreData when activeTab is material-issue)
        createMaterialRequest,
        updateMaterialRequest, // For Reject
        createMaterialIssue, // For Issue
        materials,
        loading
    } = storeData;

    // Filter pending requests
    const pendingRequests = materialRequests.filter((r: any) => r.status === 'Pending' || r.status === 'Approved');

    const handleCreateRequest = async (formData: any) => {
        try {
            await createMaterialRequest(formData);
            setIsRequestModalOpen(false);
        } catch (error) {
            console.error("Create request failed", error);
        }
    };

    const handleRejectRequest = async (request: any) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        try {
            await updateMaterialRequest(request._id, { status: 'Rejected' });
        } catch (error) {
            console.error("Reject failed", error);
        }
    };

    const handleIssueRequest = async (request: any) => {
        // For now, simpler flow: Confirm and Issue directly using request details
        // ideally opens a modal to confirm quantity/stock
        if (!confirm(`Confirm issue of materials for Request ${request.requestNumber}? Inventory will be deducted.`)) return;

        try {
            // Transform request to issue
            const issueData = {
                issueNumber: `ISS-${request.requestNumber.split('-')[1]}`, // Generate or Auto
                department: request.department,
                issuedTo: request.requestedBy?._id, // Issue to requester
                items: request.items.map((item: any) => ({
                    material: item.material, // ID
                    materialName: item.materialName,
                    quantity: item.quantity, // Default to requested quantity
                    unit: item.unit,
                    purpose: item.purpose
                })),
                date: new Date().toISOString(),
                status: 'Issued',
                requestId: request._id // Link to update request status
            };

            await createMaterialIssue(issueData);
        } catch (error) {
            console.error("Issue failed", error);
            alert("Failed to issue material. Check stock or try again.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Sub-tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setSubTab('requests')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'requests'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <CheckSquare size={16} />
                        New Requests
                        {pendingRequests.length > 0 && (
                            <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setSubTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'history'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <History size={16} />
                        Issued History
                    </button>
                </div>

                {subTab === 'requests' && (
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Plus size={18} />
                        New Request
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {subTab === 'requests' ? (
                    <MaterialRequestTable
                        requests={pendingRequests}
                        onIssue={handleIssueRequest}
                        onReject={handleRejectRequest}
                    />
                ) : (
                    <MaterialIssueHistoryTable issues={issueHistory} />
                )}
            </div>

            {/* Modals */}
            <MaterialRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleCreateRequest}
                materials={materials}
                loading={loading}
            />
        </div>
    );
}
