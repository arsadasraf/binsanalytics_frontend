"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Clock, Calendar } from "lucide-react";

interface AttendanceRecord {
    _id: string;
    employee: {
        _id: string;
        name: string;
        employeeId: string;
        department: string;
    };
    date: string;
    checkIn?: {
        time: string;
        location?: string;
    };
    checkOut?: {
        time: string;
    };
    status: string;
    hoursWorked?: number;
}

export default function PresentTab() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) return;

            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/attendance?startDate=${today}&endDate=${today}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAttendance(response.data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <UserCheck className="text-green-600" size={20} />
                        Present Employees
                    </h3>
                    <p className="text-sm text-gray-500">List of employees marked present today</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar size={16} />
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercas border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold">Employee</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Check-In</th>
                            <th className="px-6 py-4 font-semibold">Check-Out</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                </tr>
                            ))
                        ) : attendance.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Clock size={48} className="opacity-20" />
                                        <p>No attendance records found for today.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            attendance.map((record) => (
                                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-800">{record.employee?.name || "Unknown"}</p>
                                            <p className="text-xs text-gray-500">{record.employee?.employeeId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                            {record.employee?.department || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-green-700 font-medium">
                                        {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-red-700 font-medium">
                                        {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
