"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, Trash2, Save, User, Check, RefreshCw } from "lucide-react";

interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
}

export default function FaceDataMaster() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    // Fetch Employees
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
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
        } catch (error: any) {
            console.error("Training error:", error);
            alert(error.response?.data?.message || "Failed to train face data.");
        } finally {
            setTraining(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls & Camera */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-500" /> Select Employee
                    </h3>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
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

                    <button
                        onClick={handleTrain}
                        disabled={capturedImages.length < 3 || training}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all font-bold text-lg shadow-lg shadow-green-200"
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
    );
}
