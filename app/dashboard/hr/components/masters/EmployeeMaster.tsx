"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, Edit2, X, Camera, Upload, Coins, Briefcase, User, IndianRupee, Save, Phone, Mail, Check } from "lucide-react";
import axios from "axios";
import { Employee, Department, Designation, Skill } from "../../types/hr.types";

// Reusable Switch Component
const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label?: string }) => (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : "translate-x-0"}`} />
        </div>
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </div>
);

export default function EmployeeMaster() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"personal" | "professional" | "salary">("personal");

    // Camera Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    interface FormData {
        name: string;
        email: string;
        contact: string;
        department: string;
        designation: string;
        joiningDate: string;
        status: string;
        skills: string[]; // Array of Skill IDs
        experience: string;
        degree: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
        branchName: string;
        basic: number;
        hra: number;
        conveyance: number;
        medical: number;
        specialAllowance: number;
        pf: number;
        professionalTax: number;
        grossSalary: number;
        netSalary: number;
    }

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        contact: "",
        department: "",
        designation: "",
        joiningDate: new Date().toISOString().split("T")[0],
        status: "Active",
        skills: [],
        experience: "",
        degree: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        branchName: "",
        basic: 0,
        hra: 0,
        conveyance: 0,
        medical: 0,
        specialAllowance: 0,
        pf: 0,
        professionalTax: 0,
        grossSalary: 0,
        netSalary: 0,
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
        fetchDesignations();
        fetchSkills();
    }, []);

    useEffect(() => {
        const gross =
            Number(formData.basic || 0) +
            Number(formData.hra || 0) +
            Number(formData.conveyance || 0) +
            Number(formData.medical || 0) +
            Number(formData.specialAllowance || 0);

        const net = gross - Number(formData.pf || 0) - Number(formData.professionalTax || 0);

        if (gross !== formData.grossSalary || net !== formData.netSalary) {
            setFormData(prev => ({ ...prev, grossSalary: gross, netSalary: net }));
        }
    }, [formData.basic, formData.hra, formData.conveyance, formData.medical, formData.specialAllowance, formData.pf, formData.professionalTax]);

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(response.data.employees);
        } catch (error) { console.error("Error fetching employees:", error); } finally { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/department`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDepartments(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchDesignations = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/designation`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDesignations(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/skill`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAvailableSkills(response.data);
        } catch (error) { console.error(error); }
    };

    const handleOpenAdd = () => {
        setFormData({
            name: "", email: "", contact: "", department: "", designation: "",
            joiningDate: new Date().toISOString().split("T")[0], status: "Active", skills: [],
            experience: "", degree: "",
            accountNumber: "", bankName: "", ifscCode: "", branchName: "",
            basic: 0, hra: 0, conveyance: 0, medical: 0, specialAllowance: 0,
            pf: 0, professionalTax: 0, grossSalary: 0, netSalary: 0
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        setCapturedImage(null);
        setIsEditing(false);
        setCurrentId(null);
        setActiveTab("personal");
        setShowModal(true);
    };

    const handleOpenEdit = (emp: Employee) => {
        // Map existing skills (which are objects) to IDs
        const skillIds = emp.skills ? emp.skills.map((s: any) => s._id || s) : [];

        setFormData({
            name: emp.name,
            email: emp.email,
            contact: emp.contact,
            department: emp.department,
            designation: emp.designation,
            joiningDate: new Date(emp.joiningDate).toISOString().split("T")[0],
            status: emp.status,
            skills: skillIds,
            experience: emp.experience || "",
            degree: emp.degree || "",
            accountNumber: emp.paymentDetails?.accountNumber || "",
            bankName: emp.paymentDetails?.bankName || "",
            ifscCode: emp.paymentDetails?.ifscCode || "",
            branchName: emp.paymentDetails?.branchName || "",
            // Fix: Ensure we use the value if present, else 0
            basic: emp.salary?.basic ?? 0,
            hra: emp.salary?.hra ?? 0,
            conveyance: emp.salary?.conveyance ?? 0,
            medical: emp.salary?.medical ?? 0,
            specialAllowance: emp.salary?.specialAllowance ?? 0,
            pf: emp.salary?.pf ?? 0,
            professionalTax: emp.salary?.professionalTax ?? 0,
            grossSalary: emp.salary?.grossSalary ?? 0,
            netSalary: emp.salary?.netSalary ?? 0,
        });
        setPhotoPreview(emp.photo || null);
        setPhotoFile(null);
        setCapturedImage(null);
        setIsEditing(true);
        setCurrentId(emp._id);
        setActiveTab("personal");
        setShowModal(true);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = mediaStream;
            }, 100);
        } catch (err) {
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg");

                setCapturedImage(dataUrl);
                setPhotoPreview(dataUrl);

                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                        setPhotoFile(file);
                    });

                stopCamera();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };
            const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee`;

            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (!['skills', 'accountNumber', 'bankName', 'ifscCode', 'branchName',
                    'basic', 'hra', 'conveyance', 'medical', 'specialAllowance', 'grossSalary', 'pf', 'professionalTax', 'netSalary'].includes(key)) {
                    data.append(key, value as string);
                }
            });

            // Serialize complex data
            data.append("skills", JSON.stringify(formData.skills));
            data.append("paymentDetails", JSON.stringify({
                accountNumber: formData.accountNumber,
                bankName: formData.bankName,
                ifscCode: formData.ifscCode,
                branchName: formData.branchName
            }));
            data.append("salary", JSON.stringify({
                basic: formData.basic,
                hra: formData.hra,
                conveyance: formData.conveyance,
                medical: formData.medical,
                specialAllowance: formData.specialAllowance,
                grossSalary: formData.grossSalary,
                pf: formData.pf,
                professionalTax: formData.professionalTax,
                netSalary: formData.netSalary
            }));

            if (photoFile) data.append("photo", photoFile);

            if (isEditing && currentId) await axios.put(`${url}/${currentId}`, data, { headers });
            else await axios.post(url, data, { headers });

            setShowModal(false);
            fetchEmployees();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save employee.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this employee?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchEmployees();
        } catch (error) { console.error(error); }
    };

    const toggleSkill = (skillId: string) => {
        setFormData(prev => {
            const exists = prev.skills.includes(skillId);
            if (exists) return { ...prev, skills: prev.skills.filter(id => id !== skillId) };
            return { ...prev, skills: [...prev.skills, skillId] };
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none"
                    />
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all font-medium"
                >
                    <Plus size={20} /> Add Employee
                </button>
            </div>

            {/* Employee List - Responsive */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Employee</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Skills</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
                            ) : employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No employees found.</td></tr>
                            ) : (
                                employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shadow-inner">
                                                    {emp.photo ? (
                                                        <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 font-bold text-lg">{emp.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{emp.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">{emp.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{emp.designation}</div>
                                            <div className="text-sm text-gray-500">{emp.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {emp.skills && emp.skills.length > 0 ? (
                                                    emp.skills.map((skill: any, idx) => (
                                                        <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                            {skill.name}
                                                        </span>
                                                    ))
                                                ) : <span className="text-gray-400 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></span>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenEdit(emp)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(emp._id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading...</div>
                    ) : employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                        <div key={emp._id} className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shadow-inner">
                                        {emp.photo ? (
                                            <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 font-bold text-lg">{emp.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">{emp.employeeId}</div>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                    {emp.status}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600"><Briefcase size={14} className="text-gray-400" /> {emp.designation}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600"><User size={14} className="text-gray-400" /> {emp.department}</div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {emp.skills && emp.skills.length > 0 && emp.skills.map((skill: any, idx) => (
                                        <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{skill.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEdit(emp)} className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex justify-center items-center gap-2"><Edit2 size={14} /> Edit</button>
                                <button onClick={() => handleDelete(emp._id)} className="flex-1 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex justify-center items-center gap-2"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Modern Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Employee" : "Add New Employee"}</h3>
                                <p className="text-sm text-gray-500">Manage employee details, roles, and compensation.</p>
                            </div>
                            <button onClick={() => { setShowModal(false); stopCamera(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/50">
                            <div className="p-6">
                                <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit overflow-x-auto max-w-full">
                                    {[
                                        { id: "personal", icon: User, label: "Personal" },
                                        { id: "professional", icon: Briefcase, label: "Professional" },
                                        { id: "salary", icon: IndianRupee, label: "Salary & Payment" },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            <tab.icon size={16} /> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Tab */}
                                    {activeTab === "personal" && (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
                                            {/* Photo Section */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center shadow-sm">
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 w-full">Employee Photo</h4>

                                                    <div className="relative mb-6 group">
                                                        {isCameraActive ? (
                                                            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-black shadow-lg">
                                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                                                <canvas ref={canvasRef} className="hidden" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                                                                {photoPreview ? (
                                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User size={64} className="text-gray-300" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 w-full">
                                                        {isCameraActive ? (
                                                            <>
                                                                <button type="button" onClick={capturePhoto} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors col-span-2">
                                                                    <Camera size={18} /> Capture
                                                                </button>
                                                                <button type="button" onClick={stopCamera} className="col-span-2 text-center text-sm text-red-500 hover:underline">Cancel Camera</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <label className="cursor-pointer flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                                                                    <Upload size={20} className="mb-1" />
                                                                    <span className="text-xs font-medium">Upload File</span>
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            setPhotoFile(file);
                                                                            setPhotoPreview(URL.createObjectURL(file));
                                                                        }
                                                                    }} />
                                                                </label>
                                                                <button type="button" onClick={startCamera} className="flex flex-col items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100">
                                                                    <Camera size={20} className="mb-1" />
                                                                    <span className="text-xs font-medium">Use Camera</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="col-span-2">
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="e.g. Rahul Sharma" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="rahul@example.com" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Contact Number</label>
                                                            <input required type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="+91 9876543210" />
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                                                            <div className="mt-2">
                                                                <Switch
                                                                    checked={formData.status === "Active"}
                                                                    onChange={(c) => setFormData({ ...formData, status: c ? "Active" : "Inactive" })}
                                                                    label={formData.status}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Employee ID</label>
                                                            <div className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-mono text-sm">
                                                                {isEditing ? currentId?.slice(-6) : "Auto-generated"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional Tab */}
                                    {activeTab === "professional" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
                                                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-2">Role & Department</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Department</label>
                                                        <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none cursor-pointer">
                                                            <option value="">Select Department</option>
                                                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Designation</label>
                                                        <select required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none cursor-pointer">
                                                            <option value="">Select Designation</option>
                                                            {designations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date of Joining</label>
                                                        <input required type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
                                                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-2">Qualifications & Skills</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Degree / Qualification</label>
                                                        <input type="text" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="e.g. B.Tech Computer Science" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Experience</label>
                                                        <input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="e.g. 3 Years" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Skills (Select Multiple)</label>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {availableSkills.map(skill => (
                                                                <button
                                                                    key={skill._id}
                                                                    type="button"
                                                                    onClick={() => toggleSkill(skill._id)}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${formData.skills.includes(skill._id)
                                                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                                        }`}
                                                                >
                                                                    {formData.skills.includes(skill._id) && <Check size={12} />}
                                                                    {skill.name}
                                                                </button>
                                                            ))}
                                                            {availableSkills.length === 0 && <span className="text-gray-400 text-xs italic">No skills defined in Master. Add them from "Skills" tab.</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Salary & Payment Tab */}
                                    {activeTab === "salary" && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><Briefcase size={16} /> Salary Structure</h4>

                                                {/* Earnings Ref */}
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Basic</label>
                                                        <input type="number" value={formData.basic} onChange={e => setFormData({ ...formData, basic: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">HRA</label>
                                                        <input type="number" value={formData.hra} onChange={e => setFormData({ ...formData, hra: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Conveyance</label>
                                                        <input type="number" value={formData.conveyance} onChange={e => setFormData({ ...formData, conveyance: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Medical</label>
                                                        <input type="number" value={formData.medical} onChange={e => setFormData({ ...formData, medical: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Special Allowance</label>
                                                        <input type="number" value={formData.specialAllowance} onChange={e => setFormData({ ...formData, specialAllowance: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="0.00" />
                                                    </div>
                                                </div>

                                                {/* Deductions */}
                                                <h5 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Deductions</h5>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">PF</label>
                                                        <input type="number" value={formData.pf} onChange={e => setFormData({ ...formData, pf: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-red-50/50 border-transparent focus:bg-white border focus:border-red-500 rounded-lg transition-all outline-none text-red-600" placeholder="0.00" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Professional Tax</label>
                                                        <input type="number" value={formData.professionalTax} onChange={e => setFormData({ ...formData, professionalTax: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-red-50/50 border-transparent focus:bg-white border focus:border-red-500 rounded-lg transition-all outline-none text-red-600" placeholder="0.00" />
                                                    </div>
                                                </div>

                                                {/* Totals */}
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 bg-gray-50 p-4 rounded-lg">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Gross Salary</label>
                                                        <div className="text-xl font-bold text-gray-900">₹ {formData.grossSalary.toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 block">Net Salary</label>
                                                        <div className="text-xl font-bold text-green-600">₹ {formData.netSalary.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><Coins size={16} /> Banking Details</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Bank Name</label>
                                                        <input type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" placeholder="e.g. HDFC Bank" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Account Number</label>
                                                        <input type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">IFSC Code</label>
                                                        <input type="text" value={formData.ifscCode} onChange={e => setFormData({ ...formData, ifscCode: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Branch Name</label>
                                                        <input type="text" value={formData.branchName} onChange={e => setFormData({ ...formData, branchName: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg transition-all outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                                        <button type="button" onClick={() => { setShowModal(false); stopCamera(); }} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">Cancel</button>
                                        <button type="submit" disabled={submitting} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                                            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                            {isEditing ? "Update Employee" : "Create Employee"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
