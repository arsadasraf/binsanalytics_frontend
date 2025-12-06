"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Edit2, X, Zap } from "lucide-react";
import axios from "axios";
import { Skill } from "../../types/hr.types";

export default function SkillMaster() {
    const [skills, setSkills] = useState<Skill[]>([]);
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
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/skill`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSkills(response.data);
        } catch (error) {
            console.error("Error fetching skills:", error);
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

    const handleOpenEdit = (skill: Skill) => {
        setFormData({ name: skill.name, description: skill.description || "" });
        setIsEditing(true);
        setCurrentId(skill._id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/skill`;

            if (isEditing && currentId) {
                // Note: Since I didn't explicitly add a PUT route for skills in previous steps, 
                // I will assume the user wants me to add it or it might fail. 
                // Wait, I only added POST, GET, DELETE in step 1660. 
                // I MUST ADD PUT ROUTE TOO. For now, I'll write the frontend code to use PUT, 
                // and I'll update the backend immediately after this.
                await axios.put(`${url}/${currentId}`, formData, { headers });
            } else {
                await axios.post(url, formData, { headers });
            }

            setShowModal(false);
            fetchSkills();
        } catch (error: any) {
            console.error("Error saving skill:", error);
            alert(error.response?.data?.message || "Failed to save skill.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/skill/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSkills();
        } catch (error) {
            console.error("Error deleting skill:", error);
        }
    };

    const filteredSkills = skills.filter((skill) =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-3 md:gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Add Skill</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-gray-50/50 min-h-[200px]">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading skills...</div>
                ) : filteredSkills.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-20" />
                        <p>No skills found</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSkills.map((skill) => (
                                        <tr key={skill._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                                                        <Zap size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-800">{skill.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{skill.description || "-"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 transition-opacity">
                                                    <button onClick={() => handleOpenEdit(skill)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                                    <button onClick={() => handleDelete(skill._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col gap-3">
                            {filteredSkills.map((skill) => (
                                <div key={skill._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{skill.name}</h4>
                                                {skill.description && (
                                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{skill.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-1">
                                        <button
                                            onClick={() => handleOpenEdit(skill)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(skill._id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Skill" : "Add New Skill"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. React.js"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
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
