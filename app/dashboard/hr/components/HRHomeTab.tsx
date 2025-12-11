import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, BarChart3, PieChart } from 'lucide-react';
import LoadingSpinner from '@/src/components/LoadingSpinner';

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    departmentWise: { name: string; total: number; present: number; absent: number }[];
    designationWise: { name: string; total: number; present: number; absent: number }[];
}

export default function HRHomeTab() {
    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());

    useEffect(() => {
        fetchStats();
    }, [selectedDate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${backendUrl}/api/hr/stats`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { date: selectedDate }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!stats && loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;
    if (!stats) return <div className="p-10 text-center text-gray-500">Failed to load stats.</div>;

    const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                {sub && <p className={`text-xs mt-2 font-medium ${sub.includes('Absent') ? 'text-red-500' : 'text-green-600'}`}>{sub}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    // Simple Bar Chart Component using CSS
    const BarChart = ({ data, title }: { data: any[], title: string }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 size={18} /> {title}
            </h4>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-semibold text-gray-700">{item.name || 'Unknown'}</span>
                            <span className="text-gray-500 text-xs">{item.present}/{item.total} Present</span>
                        </div>
                        <div className="flex h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 h-full rounded-l-full transition-all duration-500"
                                style={{ width: `${(item.total > 0 ? (item.present / item.total) * 100 : 0)}%` }}
                                title={`Present: ${item.present}`}
                            ></div>
                            <div
                                className="bg-red-200 h-full rounded-r-full transition-all duration-500"
                                style={{ width: `${(item.total > 0 ? (item.absent / item.total) * 100 : 0)}%` }}
                                title={`Absent: ${item.absent}`}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Table View for details
    const DetailTable = ({ data, title }: { data: any[], title: string }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart size={18} /> {title} Breakdown
            </h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Name</th>
                            <th className="px-4 py-3 text-center">Total</th>
                            <th className="px-4 py-3 text-center text-green-600">Present</th>
                            <th className="px-4 py-3 text-center text-red-500 rounded-r-lg">Absent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-medium text-gray-900">{item.name || 'Unknown'}</td>
                                <td className="px-4 py-3 text-center font-bold text-gray-600">{item.total}</td>
                                <td className="px-4 py-3 text-center font-bold text-green-600">{item.present}</td>
                                <td className="px-4 py-3 text-center font-bold text-red-500">{item.absent}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const attendanceRate = stats.totalEmployees > 0
        ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Date Picker */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Attendance Overview</h2>
                    <p className="text-xs text-gray-500">Showing data for {new Date(selectedDate).toDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Employees"
                    value={stats.totalEmployees}
                    icon={Users}
                    color="bg-blue-500"
                    sub="Active Workforce"
                />
                <StatCard
                    title="Present"
                    value={stats.presentToday}
                    icon={UserCheck}
                    color="bg-green-500"
                    sub={`${attendanceRate}% Attendance Rate`}
                />
                <StatCard
                    title="Absent"
                    value={stats.absentToday}
                    icon={UserX}
                    color="bg-red-500"
                    sub={`${100 - attendanceRate}% Absenteeism`}
                />
            </div>

            {loading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {/* Charts Section */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 h-96 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <BarChart title="Department-wise Attendance" data={stats.departmentWise} />
                <DetailTable title="Designation-wise" data={stats.designationWise} />
            </div>

            <div className={`grid grid-cols-1 gap-6 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <DetailTable title="Department-wise Details" data={stats.departmentWise} />
            </div>
        </div>
    );
}
