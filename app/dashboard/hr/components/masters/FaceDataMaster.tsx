"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, Trash2, Save, User, Check, RefreshCw, Search, Plus, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/src/components/LoadingSpinner";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
    photo?: string;
    faceEncoding?: string; // "Active" if data exists
}

export default function FaceDataMaster() {
    const [view, setView] = useState<"list" | "create">("list");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Create View State
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [training, setTraining] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
        if (view === "list") {
            fetchEmployees();
        }
    }, [view]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(response.data.employees || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCreate = (employeeId?: string) => {
        setSelectedEmployee(employeeId || "");
        setCapturedImages([]);
        setView("create");
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            if (capturedImages.length >= 5) {
                alert("Maximum 5 images allowed.");
                return;
            }
            setCapturedImages((prev) => [...prev, imageSrc]);
        }
    }, [webcamRef, capturedImages]);

    const removeImage = (index: number) => {
        setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleTrain = async () => {
        if (!selectedEmployee) return alert("Please select an employee.");
        if (capturedImages.length < 3) return alert("Please capture at least 3 images for better accuracy.");

        setTraining(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("employeeId", selectedEmployee);

            // Convert base64 to blob
            for (let i = 0; i < capturedImages.length; i++) {
                const fetchRes = await fetch(capturedImages[i]);
                const blob = await fetchRes.blob();
                formData.append("files", blob, `face_${i}.jpg`);
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/face-data`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Face data saved and model trained successfully!");
            setCapturedImages([]);
            setSelectedEmployee("");
            setView("list"); // Return to list view
        } catch (error: any) {
            console.error("Training error:", error);
            alert(error.response?.data?.message || "Failed to train face data.");
        } finally {
            setTraining(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.firstName + " " + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "list") {
        return (
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-3 md:gap-4">
                    <div className="relative w-full md:w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button
                        onClick={() => handleStartCreate()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add Face Data</span>
                    </button>
                </div>

                <div className="bg-gray-50/50 min-h-[300px]">
                    {loading ? (
                        <div className="p-6 text-center">
                            <LoadingSpinner />
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                            <div className="bg-white p-4 rounded-full shadow-sm">
                                <User size={32} className="opacity-40" />
                            </div>
                            <p className="font-medium">No employees found matching your search</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Employee</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Department</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEmployees.map((emp) => (
                                            <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {emp.photo ? (
                                                            <img src={emp.photo} alt={emp.firstName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                {emp.firstName.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{emp.employeeId}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                                                        {emp.department}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {emp.faceEncoding === "Active" ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            <Check size={12} /> Registered
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                            Not Registered
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleStartCreate(emp._id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        {emp.faceEncoding === "Active" ? "Retrain" : "Register Face"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden flex flex-col gap-3">
                                {filteredEmployees.map((emp) => (
                                    <div key={emp._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {emp.photo ? (
                                                    <img src={emp.photo} alt={emp.firstName} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                        {emp.firstName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{emp.firstName} {emp.lastName}</h4>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{emp.employeeId}</p>
                                                </div>
                                            </div>
                                            {emp.faceEncoding === "Active" ? (
                                                <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 p-1.5 rounded-full text-gray-400">
                                                    <User size={16} strokeWidth={2} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold border border-blue-100">
                                                {emp.department}
                                            </span>
                                            {emp.faceEncoding === "Active" ? (
                                                <span className="text-green-700 text-xs font-medium px-2">
                                                    Face Data Active
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs font-medium px-2">
                                                    No Face Data
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleStartCreate(emp._id)}
                                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${emp.faceEncoding === "Active"
                                                    ? "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                                }`}
                                        >
                                            {emp.faceEncoding === "Active" ? "Retrain Face Model" : "Register Face"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Create/Edit View
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView("list")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                    {selectedEmployee ? "Register Face Data" : "New Face Registration"}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Controls & Camera */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            disabled={!!selectedEmployee && view === "create" && selectedEmployee !== ""}
                            // Only disable if we passed an ID explicitly, otherwise allow changing if started from "Add"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map((emp) => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{ facingMode: "user" }}
                            />
                        </div>
                        <button
                            onClick={capture}
                            disabled={!selectedEmployee || capturedImages.length >= 5}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <Camera size={20} />
                            Capture Photo ({capturedImages.length}/5)
                        </button>
                    </div>
                </div>

                {/* Right: Gallery & Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Captured Photos</h3>

                    {capturedImages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8">
                            <Camera size={48} className="mb-2 opacity-20" />
                            <p>Select employee and capture photos to start</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                            {capturedImages.map((img, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} alt={`Capture ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                        #{index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-700">
                            <p className="font-semibold mb-1">Instructions:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Capture at least 3 photos of the employee.</li>
                                <li>Ensure good lighting and face visibility.</li>
                                <li>Ask employee to slightly turn head left/right for better model.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setView("list")}
                                className="flex-1 py-4 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrain}
                                disabled={capturedImages.length < 3 || training}
                                className="flex-[2] flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all font-bold text-lg shadow-lg shadow-green-200"
                            >
                                {training ? (
                                    <>
                                        <RefreshCw size={24} className="animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <Save size={24} /> Save Face Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
