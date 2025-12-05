"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { Skill } from "../../types/hr.types";

export default function SkillMaster() {
    const [skills, setSkills] = useState<(Skill & { description?: string })[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        setError("");

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/skill`,
                { name: newSkill, description: newDescription },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewSkill("");
            setNewDescription("");
            fetchSkills();
        } catch (error: any) {
            console.error("Error adding skill:", error);
            setError(error.response?.data?.message || "Failed to add skill. Please try again.");
        }
    };

    const handleDeleteSkill = async (id: string) => {
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Skill Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Skill</h3>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                <form onSubmit={handleAddSkill} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skill Name
                        </label>
                        <input
                            type="text"
                            required
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. React.js, Project Management"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Brief description of the skill..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Skill
                    </button>
                </form>
            </div>

            {/* Skills List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Available Skills</h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{skills.length} Total</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading skills...</div>
                    ) : skills.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No skills added yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {skills.map((skill) => (
                                <li
                                    key={skill._id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div>
                                        <div className="font-medium text-gray-800">{skill.name}</div>
                                        {skill.description && <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">{skill.description}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSkill(skill._id)}
                                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Skill"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
