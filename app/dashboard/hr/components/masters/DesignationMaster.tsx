"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Edit2, X } from "lucide-react";
import axios from "axios";
import { Designation } from "../../types/hr.types";

export default function DesignationMaster() {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/designation`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setDesignations(response.data);
        } catch (error) {
            console.error("Error fetching designations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ name: "", description: "" });
        setIsEditing(false);
        setCurrentId(null);
        setShowModal(true);
    };

    const handleOpenEdit = (desig: Designation) => {
        setFormData({ name: desig.name, description: desig.description || "" });
        setIsEditing(true);
        setCurrentId(desig._id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/designation`;

            if (isEditing && currentId) {
                // Update
                await axios.put(`${url}/${currentId}`, formData, { headers });
            } else {
                // Create
                await axios.post(url, formData, { headers });
            }

            setShowModal(false);
            fetchDesignations();
        } catch (error) {
            console.error("Error saving designation:", error);
            alert("Failed to save designation. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this designation?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/designation/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchDesignations();
        } catch (error) {
            console.error("Error deleting designation:", error);
        }
    };

    const filteredDesignations = designations.filter((desig) =>
        desig.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-64">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search designations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Add Designation
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredDesignations.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No designations found
                                </td>
                            </tr>
                        ) : (
                            filteredDesignations.map((desig) => (
                                <tr
                                    key={desig._id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-gray-800 font-medium">
                                        {desig.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{desig.description || "-"}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(desig)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(desig._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditing ? "Edit Designation" : "Add New Designation"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Senior Engineer"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : isEditing ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
