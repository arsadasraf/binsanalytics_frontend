"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Clock, Calendar, Search } from "lucide-react";

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
    const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = attendance.filter(
                (record) =>
                    record.employee?.name.toLowerCase().includes(lowerTerm) ||
                    record.employee?.employeeId.toLowerCase().includes(lowerTerm)
            );
            setFilteredAttendance(filtered);
        } else {
            setFilteredAttendance(attendance);
        }
    }, [searchTerm, attendance]);

    const fetchTodayAttendance = async () => {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) return;

            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/attendance?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAttendance(response.data.attendance || []);
            setFilteredAttendance(response.data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <UserCheck className="text-green-600" size={20} />
                        Present Employees
                    </h3>
                    <p className="text-sm text-gray-500">List of employees marked present today</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm"
                        />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-600 shadow-sm w-full md:w-auto justify-center md:justify-start">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-gray-50/50 min-h-[300px]">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-24"></div>
                        ))}
                    </div>
                ) : filteredAttendance.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                        <div className="bg-white p-4 rounded-full shadow-sm">
                            <Clock size={32} className="opacity-40" />
                        </div>
                        <p className="font-medium">{searchTerm ? "No employees found matching your search." : "No attendance records found for today."}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold">Employee</th>
                                        <th className="px-6 py-4 font-semibold">Department</th>
                                        <th className="px-6 py-4 font-semibold">Check-In</th>
                                        <th className="px-6 py-4 font-semibold">Check-Out</th>
                                        <th className="px-6 py-4 font-semibold">Working Hours</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredAttendance.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{record.employee?.name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{record.employee?.employeeId}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                                                    {record.employee?.department || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                                <div className="flex items-center gap-1.5 text-green-700 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                                {record.checkOut?.time ? (
                                                    <div className="flex items-center gap-1.5 text-red-700 font-medium bg-red-50 px-2 py-1 rounded w-fit">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                        {new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-700 font-medium">
                                                {record.hoursWorked ? `${record.hoursWorked} hrs` : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${record.status === 'Present'
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col gap-3 p-4">
                            {filteredAttendance.map((record) => (
                                <div key={record._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{record.employee?.name || "Unknown"}</h4>
                                            <p className="text-xs text-gray-500 font-mono">{record.employee?.employeeId}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${record.status === 'Present'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-gray-50 text-gray-700 border-gray-100'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-100">
                                            {record.employee?.department || "N/A"}
                                        </span>
                                        {record.hoursWorked && (
                                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-100">
                                                {record.hoursWorked} hrs
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Check In</span>
                                            <span className="text-sm font-mono font-medium text-green-700">
                                                {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Check Out</span>
                                            <span className="text-sm font-mono font-medium text-red-700">
                                                {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
