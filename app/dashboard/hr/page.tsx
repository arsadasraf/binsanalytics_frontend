"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import HRTabs from "./components/HRTabs";
import DepartmentMaster from "./components/masters/DepartmentMaster";
import DesignationMaster from "./components/masters/DesignationMaster";
import EmployeeMaster from "./components/masters/EmployeeMaster";
import SkillMaster from "./components/masters/SkillMaster";
import FaceDataMaster from "./components/masters/FaceDataMaster";
import AttendanceTab from "./components/AttendanceTab";
import PresentTab from "./components/PresentTab";
import LoadingSpinner from "@/src/components/LoadingSpinner";

function HRPageContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as "home" | "master" | "attendance" | "present") || "home";

  // State for Master sub-tabs
  const [activeMasterTab, setActiveMasterTab] = useState<"department" | "designation" | "employee" | "skills" | "face-data">("department");

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500">Manage employees, departments, and attendance</p>
      </div>

      <HRTabs activeTab={activeTab} />

      <div className="mt-6">
        {activeTab === "home" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Welcome to HR Management</h2>
            <p className="text-gray-600">Overview and metrics will appear here.</p>
            {/* Future charts/stats can go here */}
          </div>
        )}

        {activeTab === "master" && (
          <div className="space-y-6">
            {/* Master Sub-tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveMasterTab("department")}
                className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeMasterTab === "department"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Department
              </button>
              <button
                onClick={() => setActiveMasterTab("designation")}
                className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeMasterTab === "designation"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Designation
              </button>
              <button
                onClick={() => setActiveMasterTab("employee")}
                className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeMasterTab === "employee"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Employee
              </button>
              <button
                onClick={() => setActiveMasterTab("skills")}
                className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeMasterTab === "skills"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveMasterTab("face-data")}
                className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${activeMasterTab === "face-data"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Face Data
              </button>
            </div>

            {/* Content Area */}
            <div>
              {activeMasterTab === "department" && <DepartmentMaster />}
              {activeMasterTab === "designation" && <DesignationMaster />}
              {activeMasterTab === "employee" && <EmployeeMaster />}
              {activeMasterTab === "skills" && <SkillMaster />}
              {activeMasterTab === "face-data" && <FaceDataMaster />}
            </div>
          </div>
        )}

        {activeTab === "attendance" && <AttendanceTab />}
        {activeTab === "present" && <PresentTab />}
      </div>
    </div>
  );
}

export default function HRPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HRPageContent />
    </Suspense>
  );
}
