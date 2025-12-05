import React from 'react';
import { BadgeCheck, XCircle, Clock, AlertCircle } from 'lucide-react';

interface MaterialRequestTableProps {
    requests: any[];
    onIssue: (request: any) => void;
    onReject: (request: any) => void;
}

export default function MaterialRequestTable({ requests, onIssue, onReject }: MaterialRequestTableProps) {
    if (!requests || requests.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Pending Requests</h3>
                <p className="text-gray-500 text-sm mt-1">New material requests will appear here.</p>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested By</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items Summary</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {requests.map((req) => (
                            <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {req.requestNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {req.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {req.requestedBy?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(req.priority)}`}>
                                        {req.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="max-w-xs truncate">
                                        {req.items?.length > 0 ? (
                                            <>
                                                <span className="font-medium">{req.items[0].materialName}</span>
                                                {req.items.length > 1 && <span className="text-gray-400 ml-1">+{req.items.length - 1} more</span>}
                                            </>
                                        ) : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onIssue(req)}
                                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm"
                                        >
                                            <BadgeCheck size={14} /> Issue
                                        </button>
                                        <button
                                            onClick={() => onReject(req)}
                                            className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
