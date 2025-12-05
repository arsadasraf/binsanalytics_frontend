import React from 'react';
import { FileText, ClipboardList } from 'lucide-react';

interface MaterialIssueHistoryTableProps {
    issues: any[];
}

export default function MaterialIssueHistoryTable({ issues }: MaterialIssueHistoryTableProps) {
    if (!issues || issues.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Issue History</h3>
                <p className="text-gray-500 text-sm mt-1">Material issues will appear here once processed.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued To</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued By</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {issues.map((issue) => (
                            <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {issue.issueNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(issue.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {issue.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {issue.issuedTo?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="max-w-xs truncate">
                                        {issue.items?.length > 0 ? (
                                            <>
                                                <span className="font-medium">{issue.items[0].materialName}</span>
                                                <span className="text-gray-400 text-xs ml-1">({issue.items[0].quantity} {issue.items[0].unit})</span>
                                                {issue.items.length > 1 && <span className="text-blue-600 text-xs ml-1">+{issue.items.length - 1} more</span>}
                                            </>
                                        ) : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {issue.issuedBy?.name || 'System'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${issue.status === 'Issued' ? 'bg-green-100 text-green-800 border border-green-200' :
                                            issue.status === 'Returned' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                                'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {issue.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
