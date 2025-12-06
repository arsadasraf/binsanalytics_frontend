import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Printer, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Salary } from '../types/hr.types';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import GenerateSalaryModal from './modals/GenerateSalaryModal';
import SalarySlipModal from './modals/SalarySlipModal';

export default function SalariesTab() {
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${backendUrl}/api/hr/salary`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { month: monthFilter, year: yearFilter }
            });
            setSalaries(res.data);
        } catch (error) {
            console.error("Error fetching salaries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    }, [monthFilter, yearFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this salary record?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${backendUrl}/api/hr/salary/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSalaries();
        } catch (error) {
            console.error("Error deleting salary:", error);
            alert("Failed to delete salary record");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[2023, 2024, 2025].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Generate Salary
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
            ) : salaries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Salaries Generated</h3>
                    <p className="text-gray-500 text-sm mt-1">Generate salary slips for {monthFilter} {yearFilter} to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salaries
                        .filter(s => {
                            const empName = typeof s.employee === 'object' ? s.employee.name : '';
                            return empName.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map((salary) => (
                            <div key={salary._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{typeof salary.employee === 'object' ? salary.employee.name : 'Unknown'}</h4>
                                        <p className="text-xs text-gray-500">{typeof salary.employee === 'object' ? salary.employee.designation : ''}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {salary.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>Present Days:</span>
                                        <span className="font-medium">{salary.presentDays} / {salary.workingDays}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Earnings:</span>
                                        <span className="font-medium text-green-600">₹ {salary.grossSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deductions:</span>
                                        <span className="font-medium text-red-600">₹ {(salary.deductions + salary.salaryComponents.pf + salary.salaryComponents.professionalTax).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-100">
                                        <span className="font-bold text-gray-900">Net Salary:</span>
                                        <span className="font-bold text-blue-600">₹ {salary.netSalary.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedSalary(salary);
                                            setShowSlipModal(true);
                                        }}
                                        className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center justify-center gap-2"
                                    >
                                        <Printer size={16} /> Print
                                    </button>
                                    <button onClick={() => handleDelete(salary._id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Modals */}
            <GenerateSalaryModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                onSuccess={fetchSalaries}
            />

            <SalarySlipModal
                isOpen={showSlipModal}
                onClose={() => setShowSlipModal(false)}
                salary={selectedSalary}
            />
        </div>
    );
}
