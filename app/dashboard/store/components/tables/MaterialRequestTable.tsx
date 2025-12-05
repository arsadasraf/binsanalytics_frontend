import React from 'react';
import { BadgeCheck, XCircle, Clock, Eye, Calendar, ArrowRight, FileText } from 'lucide-react';

interface MaterialRequestTableProps {
    requests: any[];
    onIssue: (request: any) => void;
    onReject: (request: any) => void;
    onView: (request: any) => void;
}

export default function MaterialRequestTable({ requests, onIssue, onReject, onView }: MaterialRequestTableProps) {
    if (!requests || requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 h-64">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No New Requests</h3>
                <p className="text-gray-500 mt-1">Material requests from departments will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Request #</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Requester</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Items Summary</th>
                            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((request) => (
                            <tr
                                key={request._id}
                                className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                onClick={() => onView(request)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-xs">
                                            {request.items.length}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{request.requestNumber}</div>
                                            <div className="text-xs text-gray-500">{request.status}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm font-medium text-gray-900">{request.requestedBy?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{request.requestedBy?.email}</div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {request.items.slice(0, 2).map((item: any, i: number) => (
                                            <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200">
                                                {item.materialName} ({item.quantity} {item.unit})
                                            </span>
                                        ))}
                                        {request.items.length > 2 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-500 text-xs border border-gray-100">
                                                +{request.items.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onView(request)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onReject(request)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => onIssue(request)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 text-xs font-medium transition-all"
                                        >
                                            Issue Items <ArrowRight size={14} />
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
