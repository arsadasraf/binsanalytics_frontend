"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, UserCheck, AlertCircle, Clock } from "lucide-react";

export default function AttendanceTab() {
    const webcamRef = useRef<Webcam>(null);
    const [lastScanResult, setLastScanResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const captureAndScan = useCallback(async () => {
        if (scanning) return;
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        setScanning(true);
        try {
            // Convert base64 to blob
            const fetchRes = await fetch(imageSrc);
            const blob = await fetchRes.blob();

            const formData = new FormData();
            formData.append("file", blob, "capture.jpg");

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
                console.error("No authentication token found");
                setLastScanResult({ status: "error", message: "Authentication failed. Please login again." });
                return;
            }

            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/hr/mark-attendance";

            const response = await axios.post(
                apiUrl,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const result = response.data;

            // Only update UI if result is significant (success, or specific error)
            // If "No face detected" in auto-mode, maybe don't flash error too much?
            if (result.status === "success" || result.status === "warning") {
                setLastScanResult({ ...result, timestamp: new Date() });
                // Play sound?
            } else if (result.status === "unknown" && !autoMode) {
                setLastScanResult({ status: "error", message: "Face not recognized", timestamp: new Date() });
            }

        } catch (error) {
            console.error("Scan error:", error);
        } finally {
            setScanning(false);
        }
    }, [scanning, autoMode]);

    // Auto-scan interval
    useEffect(() => {
        if (autoMode) {
            intervalRef.current = setInterval(() => {
                captureAndScan();
            }, 3000); // Scan every 3 seconds
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoMode, captureAndScan]);

    // Clear result after 5 seconds
    useEffect(() => {
        if (lastScanResult) {
            const timer = setTimeout(() => setLastScanResult(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastScanResult]);

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-900 rounded-2xl overflow-hidden relative">
            {/* Camera View */}
            <div className="flex-1 relative">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                />

                {/* Overlay Scanner Line */}
                {autoMode && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan-y"></div>
                    </div>
                )}

                {/* Feedback Overlay */}
                {lastScanResult && (
                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl shadow-2xl backdrop-blur-md border-2 animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-4 ${lastScanResult.status === "success"
                        ? "bg-green-500/90 border-green-400 text-white"
                        : lastScanResult.status === "warning"
                            ? "bg-yellow-500/90 border-yellow-400 text-white"
                            : "bg-red-500/90 border-red-400 text-white"
                        }`}>
                        <div className="p-2 bg-white/20 rounded-full">
                            {lastScanResult.status === "success" ? <UserCheck size={32} /> :
                                lastScanResult.status === "warning" ? <Clock size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">
                                {lastScanResult.status === "success" ? "Access Granted" :
                                    lastScanResult.status === "warning" ? "Already Marked" : "Access Denied"}
                            </h3>
                            <p className="text-white/90 text-sm font-medium">
                                {lastScanResult.employee ? `Welcome, ${lastScanResult.employee}` : lastScanResult.message}
                            </p>
                            {lastScanResult.time && <p className="text-xs mt-1 opacity-80">{lastScanResult.time}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="bg-gray-800 p-4 flex justify-between items-center z-10">
                <div className="text-white">
                    <h2 className="font-bold text-lg">Attendance Kiosk</h2>
                    <p className="text-xs text-gray-400">Position your face within the frame</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${autoMode ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                    >
                        {autoMode ? "Auto-Scan ON" : "Auto-Scan OFF"}
                    </button>

                    {!autoMode && (
                        <button
                            onClick={captureAndScan}
                            disabled={scanning}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Camera size={20} /> Scan Now
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes scan-y {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan-y {
            animation: scan-y 3s linear infinite;
        }
    `}</style>
        </div>
    );
}
