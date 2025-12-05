"use client";

import React, { useState, useEffect } from "react";
import { saasAdminAuth } from "@/lib/saasAdminAuth";

interface DashboardStats {
    totalCompanies: number;
    verifiedCompanies: number;
    unverifiedCompanies: number;
    totalUsers: number;
    recentCompanies: number;
    companiesByMonth: Array<{ _id: { year: number; month: number }; count: number }>;
    recentRegistrations: Array<any>;
}

interface Company {
    _id: string;
    companyName: string;
    email: string;
    contactNumber: string;
    city: string;
    isVerified: boolean;
    createdAt: string;
    userCount: number;
}

interface User {
    _id: string;
    name: string;
    email: string;
    userId: string;
    department: string;
    company: {
        _id: string;
        companyName: string;
    };
    createdAt: string;
}

export default function SaasDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "companies" | "users">("overview");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadDashboardStats();
    }, []);

    useEffect(() => {
        if (activeTab === "companies") {
            loadCompanies();
        } else if (activeTab === "users") {
            loadUsers();
        }
    }, [activeTab]);

    const loadDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await saasAdminAuth.fetchWithAuth("/dashboard-stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to load dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const response = await saasAdminAuth.fetchWithAuth("/companies");
            setCompanies(response.data);
        } catch (error) {
            console.error("Failed to load companies:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await saasAdminAuth.fetchWithAuth("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        if (!confirm("Are you sure you want to delete this company? All associated users will also be deleted.")) {
            return;
        }

        try {
            await saasAdminAuth.fetchWithAuth(`/companies/${companyId}`, {
                method: "DELETE",
            });
            loadCompanies();
            loadDashboardStats();
            alert("Company deleted successfully");
        } catch (error: any) {
            alert(error.message || "Failed to delete company");
        }
    };

    const handleToggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
        try {
            await saasAdminAuth.fetchWithAuth(`/companies/${companyId}/status`, {
                method: "PUT",
                body: JSON.stringify({ isVerified: !currentStatus }),
            });
            loadCompanies();
            loadDashboardStats();
        } catch (error: any) {
            alert(error.message || "Failed to update company status");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await saasAdminAuth.fetchWithAuth(`/users/${userId}`, {
                method: "DELETE",
            });
            loadUsers();
            loadDashboardStats();
            alert("User deleted successfully");
        } catch (error: any) {
            alert(error.message || "Failed to delete user");
        }
    };

    const filterCompanies = () => {
        if (!companies || !Array.isArray(companies)) return [];
        if (!searchTerm) return companies;

        return companies.filter((company) => {
            if (!company) return false;
            const nameMatch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = company.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const cityMatch = company.city?.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || emailMatch || cityMatch;
        });
    };

    const filterUsers = () => {
        if (!users || !Array.isArray(users)) return [];
        if (!searchTerm) return users;

        return users.filter((user) => {
            if (!user) return false;
            const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const companyMatch = user.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || emailMatch || companyMatch;
        });
    };

    const filteredCompanies = filterCompanies();
    const filteredUsers = filterUsers();

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "overview"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("companies")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "companies"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        Companies
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "users"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        Users
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Companies</p>
                                    <p className="text-3xl font-bold mt-1">{stats.totalCompanies}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Verified Companies</p>
                                    <p className="text-3xl font-bold mt-1">{stats.verifiedCompanies}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-pink-100 text-sm">Recent (30 days)</p>
                                    <p className="text-3xl font-bold mt-1">{stats.recentCompanies}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Registrations */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Registrations</h2>
                        <div className="space-y-3">
                            {stats.recentRegistrations.map((company) => (
                                <div
                                    key={company._id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900">{company.companyName}</p>
                                        <p className="text-sm text-slate-500">{company.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">{company.city}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(company.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Companies Tab */}
            {activeTab === "companies" && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <input
                            type="text"
                            placeholder="Search companies by name, email, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Companies Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Users
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Registered
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredCompanies.map((company) => (
                                        <tr key={company._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">{company.companyName}</p>
                                                    <p className="text-sm text-slate-500">{company.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{company.contactNumber}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{company.city}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {company.userCount} users
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.isVerified
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {company.isVerified ? "Verified" : "Unverified"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(company.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleToggleCompanyStatus(company._id, company.isVerified)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    >
                                                        {company.isVerified ? "Disable" : "Enable"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCompany(company._id)}
                                                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <input
                            type="text"
                            placeholder="Search users by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Registered
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {users && users.length > 0 ? (
                                        users
                                            .filter((user) => {
                                                if (!searchTerm) return true;
                                                if (!user) return false;
                                                const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
                                                const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                                const companyMatch = user.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
                                                return nameMatch || emailMatch || companyMatch;
                                            })
                                            .map((user) => (
                                                <tr key={user._id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{user.name}</p>
                                                            <p className="text-sm text-slate-500">{user.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{user.company?.companyName || "N/A"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {user.department}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                {loading ? "Loading users..." : "No users found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                        <div className="flex items-center space-x-3">
                            <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-slate-600 font-medium">Loading...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
