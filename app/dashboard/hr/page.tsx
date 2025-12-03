"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/src/lib/api";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";

type TabType = "employees" | "attendance";

export default function HRPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ skills: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const userInfoStr = localStorage.getItem("userInfo");
    
    if (!token) {
      router.push("/login");
      return;
    }

    // Check if user has HR access
    if (userType === "user" && userInfoStr) {
      const user = JSON.parse(userInfoStr);
      if (user.department !== "HR") {
        setError("Access denied. You don't have permission to access HR module.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        return;
      }
    }
    
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (activeTab === "employees") {
        const result = await apiGet(`/api/hr/employee`, token);
        setEmployees(result.employees || []);
      } else {
        const result = await apiGet(`/api/hr/attendance`, token);
        setAttendance(result.attendance || []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data. Please try again.");
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (err) {
      setError("Failed to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            setPhoto(file);
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      if (activeTab === "employees") {
        Object.keys(formData).forEach((key) => {
          if (key === "skills") {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key !== "photo" && formData[key] !== undefined && formData[key] !== null) {
            formDataToSend.append(key, String(formData[key]));
          }
        });

        if (photo) {
          formDataToSend.append("photo", photo);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/employee`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create employee");
        }

        setSuccess("Employee created successfully!");
      } else {
        // Attendance check-in/out
        const formDataToSend2 = new FormData();
        formDataToSend2.append("employeeId", formData.employeeId);
        formDataToSend2.append("type", formData.type);
        formDataToSend2.append("location", formData.location || "");

        if (photo) {
          formDataToSend2.append("photo", photo);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/hr/attendance`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend2,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to record attendance");
        }

        setSuccess(`${formData.type === "checkIn" ? "Check-in" : "Check-out"} recorded successfully!`);
      }

      setShowForm(false);
      setFormData({ skills: [] });
      setPhoto(null);
      setTimeout(() => {
        fetchData();
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      console.error("Error submitting:", err);
      setError(err.message || "Failed to submit. Please try again.");
    }
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), { name: "", level: 1, certified: false }],
    });
  };

  const removeSkill = (index: number) => {
    const skills = [...(formData.skills || [])];
    skills.splice(index, 1);
    setFormData({ ...formData, skills });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const skills = [...(formData.skills || [])];
    skills[index] = { ...skills[index], [field]: value };
    setFormData({ ...formData, skills });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
            <p className="text-gray-600 mt-1">Manage employees and attendance</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
              setPhoto(null);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {showForm
              ? "Cancel"
              : activeTab === "employees"
              ? "+ Add Employee"
              : "Record Attendance"}
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("employees");
                  setShowForm(false);
                }}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "employees"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => {
                  setActiveTab("attendance");
                  setShowForm(false);
                }}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "attendance"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Attendance
              </button>
            </nav>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {activeTab === "employees" ? "Add New Employee" : "Record Attendance"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "employees" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.employeeId || ""}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                      <input
                        type="text"
                        required
                        value={formData.contact || ""}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <input
                        type="text"
                        required
                        value={formData.department || ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                      <input
                        type="text"
                        required
                        value={formData.designation || ""}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.joiningDate || ""}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    {(formData.skills || []).map((skill: any, index: number) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Skill name"
                          value={skill.name || ""}
                          onChange={(e) => updateSkill(index, "name", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Level (1-5)"
                          value={skill.level || 1}
                          onChange={(e) => updateSkill(index, "level", parseInt(e.target.value))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={skill.certified || false}
                            onChange={(e) => updateSkill(index, "certified", e.target.checked)}
                          />
                          <span className="text-sm">Certified</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSkill}
                      className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      + Add Skill
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                    {photo && <p className="text-sm text-gray-600 mb-2">Photo selected: {photo.name}</p>}
                    {!showCamera ? (
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Open Camera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setPhoto(e.target.files[0]);
                            }
                          }}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <video ref={videoRef} autoPlay className="w-full max-w-md rounded-md"></video>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId || ""}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select type</option>
                      <option value="checkIn">Check In</option>
                      <option value="checkOut">Check Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                    {photo && <p className="text-sm text-gray-600 mb-2">Photo selected: {photo.name}</p>}
                    {!showCamera ? (
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Open Camera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setPhoto(e.target.files[0]);
                            }
                          }}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <video ref={videoRef} autoPlay className="w-full max-w-md rounded-md"></video>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ skills: [] });
                    setPhoto(null);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data List */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === "employees" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === "employees" ? employees : attendance).map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {activeTab === "employees" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.designation}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.employee?.name || item.employee?.employeeId || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.checkIn?.time ? new Date(item.checkIn.time).toLocaleTimeString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.checkOut?.time ? new Date(item.checkOut.time).toLocaleTimeString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.hoursWorked || 0} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === "Present"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {(activeTab === "employees" ? employees : attendance).length === 0 && (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

