"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import PPCMasterTab from "./components/PPCMasterTab";
import PPCTabs from "./components/PPCTabs";

// Define Tab Types
type PPCTab = "home" | "orders" | "auto-planning" | "master";
type OrderSubTab = "po-list" | "create-po" | "create-workorder";
type MasterSubTab = "machine-list" | "material" | "customer" | "supplier";

export default function PPCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse tabs from URL or default
  const tab = (searchParams.get("tab") as PPCTab) || "home";
  const subTab = searchParams.get("subTab");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const userInfoStr = localStorage.getItem("userInfo");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userType === "user" && userInfoStr) {
      const user = JSON.parse(userInfoStr);
      // Allow access if department is PPC or if user is Company Admin
      if (user.department !== "PPC") {
        setError("Access denied. You don't have permission to access PPC module.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        return;
      }
    }

    setLoading(false);
  }, [router]);

  // Helper to update URL with tab and subTab
  const navigateTo = (newTab: PPCTab, newSubTab?: string) => {
    const params = new URLSearchParams();
    params.set("tab", newTab);
    if (newSubTab) params.set("subTab", newSubTab);
    router.push(`/dashboard/ppc?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">PPC Management</h1>
          <p className="text-gray-600 mt-1">Production Planning & Control</p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

        {/* Main Tabs Navigation */}
        <PPCTabs activeTab={tab} />

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[500px]">

          {/* HOME TAB */}
          {tab === "home" && <HomeTab />}

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <OrdersLayout
              currentSubTab={(subTab as OrderSubTab) || "po-list"}
              onChangeSubTab={(st) => navigateTo("orders", st)}
              setSuccess={setSuccess}
              setError={setError}
            />
          )}

          {/* AUTO PLANNING TAB */}
          {tab === "auto-planning" && <AutoPlanningTab setSuccess={setSuccess} setError={setError} />}

          {/* MASTER TAB */}
          {tab === "master" && (
            <div className="flex flex-col gap-4">
              {/* Master Sub-tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b">
                <button
                  onClick={() => navigateTo("master", "machine-list")}
                  className={`px-4 py-2 font-medium text-sm ${subTab === "machine-list" ? "bg-indigo-50 text-indigo-700 rounded-t-lg border-b-2 border-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Machine List
                </button>
                <button
                  onClick={() => navigateTo("master", "material")}
                  className={`px-4 py-2 font-medium text-sm ${subTab === "material" ? "bg-indigo-50 text-indigo-700 rounded-t-lg border-b-2 border-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Material
                </button>
                <button
                  onClick={() => navigateTo("master", "customer")}
                  className={`px-4 py-2 font-medium text-sm ${subTab === "customer" ? "bg-indigo-50 text-indigo-700 rounded-t-lg border-b-2 border-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Customer
                </button>
                <button
                  onClick={() => navigateTo("master", "supplier")}
                  className={`px-4 py-2 font-medium text-sm ${subTab === "supplier" ? "bg-indigo-50 text-indigo-700 rounded-t-lg border-b-2 border-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Supplier
                </button>
              </div>

              <PPCMasterTab subTab={(subTab as MasterSubTab) || "machine-list"} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

// Home Tab Component
function HomeTab() {
  const [subTab, setSubTab] = useState<"machines" | "employees">("machines");
  const [machines, setMachines] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [subTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      if (subTab === "machines") {
        const res = await fetch(`${API_BASE_URL}/api/ppc/machine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMachines(data.machines || []);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/ppc/manpower`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployees(data.manpower || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (id: string, type: "machine" | "employee") => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const endpoint = type === "machine"
        ? `${API_BASE_URL}/api/ppc/machine/${id}/schedules`
        : `${API_BASE_URL}/api/ppc/employee/${id}/schedules`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    fetchSchedules(item._id, subTab === "machines" ? "machine" : "employee");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => {
            setSubTab("machines");
            setSelectedItem(null);
            setSchedules([]);
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${subTab === "machines"
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Machines
        </button>
        <button
          onClick={() => {
            setSubTab("employees");
            setSelectedItem(null);
            setSchedules([]);
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${subTab === "employees"
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Employees
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div>
            <h3 className="font-semibold mb-3">{subTab === "machines" ? "Machine List" : "Employee List"}</h3>
            <div className="space-y-2">
              {subTab === "machines" ? (
                machines.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No machines found</p>
                ) : (
                  machines.map((machine) => (
                    <div
                      key={machine._id}
                      onClick={() => handleItemClick(machine)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedItem?._id === machine._id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{machine.machineName}</p>
                          <p className="text-sm text-gray-600">{machine.machineCode}</p>
                          <p className="text-sm text-gray-500">{machine.machineType}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${machine.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : machine.status === "Busy"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {machine.status}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                employees.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No employees found</p>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() => handleItemClick(emp)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedItem?._id === emp._id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{emp.employee?.name || "N/A"}</p>
                          <p className="text-sm text-gray-600">{emp.employee?.employeeId || "N/A"}</p>
                          <p className="text-sm text-gray-500">
                            Skills: {emp.skills?.map((s: any) => s.name).join(", ") || "None"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${emp.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : emp.status === "Busy"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {emp.status}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Schedules */}
          <div>
            <h3 className="font-semibold mb-3">Schedules</h3>
            {!selectedItem ? (
              <p className="text-gray-500 text-center py-8">
                Select a {subTab === "machines" ? "machine" : "employee"} to view schedules
              </p>
            ) : schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No schedules found</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium">{schedule.workOrder?.workOrderNumber || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                      PO: {schedule.workOrder?.po?.orderNumber || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Component: {schedule.workOrder?.component?.componentName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Operation: {schedule.operation?.operationName || "N/A"}
                    </p>
                    {schedule.operation?.scheduledStart && (
                      <p className="text-xs text-gray-500 mt-2">
                        Start: {new Date(schedule.operation.scheduledStart).toLocaleString()}
                      </p>
                    )}
                    {schedule.operation?.scheduledEnd && (
                      <p className="text-xs text-gray-500">
                        End: {new Date(schedule.operation.scheduledEnd).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Orders Layout Component
function OrdersLayout({ currentSubTab, onChangeSubTab, setSuccess, setError }: {
  currentSubTab: OrderSubTab;
  onChangeSubTab: (tab: OrderSubTab) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}) {
  return (
    <div>
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => onChangeSubTab("po-list")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${currentSubTab === "po-list"
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          PO List
        </button>
        <button
          onClick={() => onChangeSubTab("create-po")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${currentSubTab === "create-po"
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Create PO
        </button>
        <button
          onClick={() => onChangeSubTab("create-workorder")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${currentSubTab === "create-workorder"
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Create Work Order
        </button>
      </div>

      {currentSubTab === "po-list" && <POListTab />}
      {currentSubTab === "create-po" && <CreatePOTab setSuccess={setSuccess} setError={setError} />}
      {currentSubTab === "create-workorder" && <CreateWorkOrderTab setSuccess={setSuccess} setError={setError} />}
    </div>
  );
}

// PO List Tab Component
function POListTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No POs found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                  <p className="text-sm text-gray-600">Product: {order.productName}</p>
                  <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${order.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "InProgress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">{order.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${order.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Dispatch Date: {new Date(order.dispatchDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create PO Tab Component
function CreatePOTab({ setSuccess, setError }: any) {
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    dispatchDate: "",
    priority: "Medium",
    remarks: "",
  });
  const [components, setComponents] = useState<any[]>([]);
  const [routeCards, setRouteCards] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRouteCards();
  }, []);

  const fetchRouteCards = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/route-card`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRouteCards(data.routeCards || []);
    } catch (error) {
      console.error("Error fetching route cards:", error);
    }
  };

  const addComponent = () => {
    setComponents([
      ...components,
      {
        componentCode: "",
        componentName: "",
        quantity: 1,
        routeCard: "",
      },
    ]);
  };

  const removeComponent = (index: number) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setComponents(newComponents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      // Create PO
      const poRes = await fetch(`${API_BASE_URL}/api/ppc/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          productCode: "MULTI",
          productName: "Multiple Components",
          quantity: components.reduce((sum, c) => sum + (parseInt(c.quantity) || 0), 0),
        }),
      });

      if (!poRes.ok) {
        const errorData = await poRes.json();
        throw new Error(errorData.message || "Failed to create PO");
      }

      const poData = await poRes.json();
      const poId = poData.order._id;

      // Create components
      for (const comp of components) {
        await fetch(`${API_BASE_URL}/api/ppc/component`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            po: poId,
            ...comp,
          }),
        });
      }

      setSuccess("PO created successfully with all components!");
      setFormData({
        orderNumber: "",
        customerName: "",
        dispatchDate: "",
        priority: "Medium",
        remarks: "",
      });
      setComponents([]);
    } catch (error: any) {
      setError(error.message || "Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create New PO</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PO Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number *</label>
            <input
              type="text"
              required
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Date *</label>
            <input
              type="date"
              required
              value={formData.dispatchDate}
              onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Components */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Components *</label>
            <button
              type="button"
              onClick={addComponent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              + Add Component
            </button>
          </div>

          {components.length === 0 ? (
            <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md">
              No components added. Click "Add Component" to add.
            </p>
          ) : (
            <div className="space-y-3">
              {components.map((comp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Component Code *"
                      required
                      value={comp.componentCode}
                      onChange={(e) => updateComponent(index, "componentCode", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Component Name *"
                      required
                      value={comp.componentName}
                      onChange={(e) => updateComponent(index, "componentName", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Quantity *"
                      required
                      min="1"
                      value={comp.quantity}
                      onChange={(e) => updateComponent(index, "quantity", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={comp.routeCard}
                      onChange={(e) => updateComponent(index, "routeCard", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Route Card</option>
                      {routeCards.map((rc) => (
                        <option key={rc._id} value={rc._id}>
                          {rc.routeCardNumber} - {rc.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Component
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || components.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create PO"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Create Work Order Tab Component
function CreateWorkOrderTab({ setSuccess, setError }: any) {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [routeCard, setRouteCard] = useState<any>(null);
  const [formData, setFormData] = useState({
    workOrderNumber: "",
    quantity: 1,
    remarks: "",
  });
  const [operations, setOperations] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [manpower, setManpower] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComponents();
    fetchMachines();
    fetchManpower();
  }, []);

  const fetchComponents = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/component`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComponents(data.components || []);
    } catch (error) {
      console.error("Error fetching components:", error);
    }
  };

  const fetchMachines = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/machine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMachines(data.machines || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  const fetchManpower = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/manpower`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setManpower(data.manpower || []);
    } catch (error) {
      console.error("Error fetching manpower:", error);
    }
  };

  const handleComponentChange = (componentId: string) => {
    setSelectedComponent(componentId);
    const comp = components.find((c) => c._id === componentId);

    if (comp && comp.routeCard) {
      setRouteCard(comp.routeCard);
      setOperations(
        comp.routeCard.operations.map((op: any) => ({
          ...op,
          assignedMachine: "",
          assignedManpower: [],
          scheduledStart: "",
          scheduledEnd: "",
        }))
      );
    } else {
      setRouteCard(null);
      setOperations([]);
    }
  };

  const updateOperation = (index: number, field: string, value: any) => {
    const newOps = [...operations];
    newOps[index] = { ...newOps[index], [field]: value };
    setOperations(newOps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const comp = components.find((c) => c._id === selectedComponent);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/workorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          component: selectedComponent,
          po: comp.po._id,
          routeCard: comp.routeCard?._id,
          operations,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create work order");
      }

      setSuccess("Work order created successfully!");
      setFormData({
        workOrderNumber: "",
        quantity: 1,
        remarks: "",
      });
      setSelectedComponent("");
      setRouteCard(null);
      setOperations([]);
    } catch (error: any) {
      setError(error.message || "Failed to create work order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create Work Order</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Work Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Order Number *</label>
            <input
              type="text"
              required
              value={formData.workOrderNumber}
              onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Component *</label>
            <select
              required
              value={selectedComponent}
              onChange={(e) => handleComponentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a component</option>
              {components.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.componentName} ({c.componentCode}) - PO: {c.po?.orderNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Operations */}
        {routeCard && operations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Operations</h3>
            <div className="space-y-4">
              {operations.map((op, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <p className="font-medium mb-2">
                    {op.sequence}. {op.operationName}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Machine Type: {op.machineType} | Standard Time: {op.standardTime} min
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign Machine</label>
                      <select
                        value={op.assignedMachine || ""}
                        onChange={(e) => updateOperation(index, "assignedMachine", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Machine</option>
                        {machines
                          .filter((m) => m.machineType === op.machineType)
                          .map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.machineName} ({m.machineCode})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign Employees</label>
                      <select
                        multiple
                        value={op.assignedManpower || []}
                        onChange={(e) =>
                          updateOperation(
                            index,
                            "assignedManpower",
                            Array.from(e.target.selectedOptions, (option) => option.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        size={3}
                      >
                        {manpower.map((mp) => (
                          <option key={mp._id} value={mp._id}>
                            {mp.employee?.name} ({mp.employee?.employeeId})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start</label>
                      <input
                        type="datetime-local"
                        value={op.scheduledStart || ""}
                        onChange={(e) => updateOperation(index, "scheduledStart", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled End</label>
                      <input
                        type="datetime-local"
                        value={op.scheduledEnd || ""}
                        onChange={(e) => updateOperation(index, "scheduledEnd", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !selectedComponent}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Work Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Auto Planning Tab Component
function AutoPlanningTab({ setSuccess, setError }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/order?status=Pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPlan = async (orderId: string) => {
    setScheduling(orderId);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/ppc/auto-schedule/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to schedule order");
      }

      setSuccess("Order scheduled successfully!");
      fetchPendingOrders();
    } catch (error: any) {
      setError(error.message || "Failed to schedule order");
    } finally {
      setScheduling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Auto Planning</h2>

      <p className="text-gray-600 mb-6">
        Automatically schedule pending orders by allocating jobs to available machines and employees.
      </p>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending orders to schedule</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                  <p className="text-sm text-gray-600">Product: {order.productName}</p>
                  <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                  <p className="text-sm text-gray-500">
                    Priority: <span className="font-medium">{order.priority}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dispatch Date: {new Date(order.dispatchDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleAutoPlan(order._id)}
                  disabled={scheduling === order._id}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduling === order._id ? "Scheduling..." : "Auto Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
