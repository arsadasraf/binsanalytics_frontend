import React, { useState, useEffect } from 'react';
import { X, Calculator, User } from 'lucide-react';
import axios from 'axios';
import { Employee } from '../../types/hr.types';

interface GenerateSalaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GenerateSalaryModal({ isOpen, onClose, onSuccess }: GenerateSalaryModalProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [employeeId, setEmployeeId] = useState("");
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear());
    const [otHours, setOtHours] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [incentives, setIncentives] = useState(0);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${backendUrl}/api/v1/hr/employee`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter active employees
            setEmployees(res.data.filter((e: Employee) => e.status === "Active"));
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) return alert("Please select an employee");

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(`${backendUrl}/api/v1/hr/salary`, {
                employeeId,
                month,
                year,
                overtimeHours: Number(otHours),
                deductions: Number(deductions),
                incentives: Number(incentives)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSuccess();
            onClose();
            // Reset form
            setEmployeeId("");
            setOtHours(0);
            setDeductions(0);
            setIncentives(0);
        } catch (error: any) {
            console.error("Error generating salary:", error);
            alert(error.response?.data?.message || "Failed to generate salary");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calculator size={20} className="text-blue-600" />
                        Generate Salary Slip
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Employee Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                required
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                            >
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                {[2023, 2024, 2025].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Adjustments */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary Adjustments</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Overtime (Hours)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={otHours}
                                onChange={(e) => setOtHours(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Calculated based on basic salary hourly rate.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Incentives (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={incentives}
                                    onChange={(e) => setIncentives(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 border-green-200"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={deductions}
                                    onChange={(e) => setDeductions(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 border-red-200"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            {loading ? "Generating..." : "Generate Salary"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
