"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/src/lib/api";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { Plus, Trash2, Search, MapPin, Truck, ShoppingCart, Database, Camera } from "lucide-react";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TabType = "home" | "material-issue" | "grn" | "dc" | "billing" | "po" | "masters";
type MasterType = "vendor" | "customer" | "location" | "category";

function StoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "home";

  // State
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ items: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Specific states
  const [issueTab, setIssueTab] = useState<"present" | "issued">("present");
  const [masterTab, setMasterTab] = useState<MasterType>("vendor");
  const [photos, setPhotos] = useState<File[]>([]);

  // Master Data for Dropdowns
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Placeholder for form section - this will connect to the existing JSX below
  // The existing code starting at line 12 is part of the renderForm function
  const renderFormVendorCustomer = (
    <>
      <input
        type="text"
        placeholder="Name *"
        className="input-field"
        required
        value={formData.name || ""}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      {/* Code is auto-generated */}
      <input
        type="text"
        placeholder="Contact Person"
        className="input-field"
        value={formData.contactPerson || ""}
        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
      />
      <input
        type="text"
        placeholder="Phone"
        className="input-field"
        value={formData.phone || ""}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        className="input-field"
        value={formData.email || ""}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="GST Number"
        className="input-field"
        value={formData.gst || ""}
        onChange={e => setFormData({ ...formData, gst: e.target.value })}
      />
      <textarea
        placeholder="Address"
        className="input-field sm:col-span-2"
        value={formData.address || ""}
        onChange={e => setFormData({ ...formData, address: e.target.value })}
      />

      {masterTab === "customer" && (
        <>
          <textarea
            placeholder="Billing Address"
            className="input-field sm:col-span-2"
            value={formData.billingAddress || ""}
            onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
          />
          <textarea
            placeholder="Shipping Address"
            className="input-field sm:col-span-2"
            value={formData.shippingAddress || ""}
            onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
          />
        </>
      )}

      {/* Bank Details */}
      <div className="sm:col-span-2 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Bank Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Account Number"
            className="input-field"
            value={formData.bankDetails?.accountNumber || ""}
            onChange={e => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
            })}
          />
          <input
            type="text"
            placeholder="IFSC Code"
            className="input-field"
            value={formData.bankDetails?.ifscCode || ""}
            onChange={e => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, ifscCode: e.target.value }
            })}
          />
          <input
            type="text"
            placeholder="Bank Name"
            className="input-field"
            value={formData.bankDetails?.bankName || ""}
            onChange={e => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, bankName: e.target.value }
            })}
          />
          <input
            type="text"
            placeholder="Branch Name"
            className="input-field"
            value={formData.bankDetails?.branchName || ""}
            onChange={e => setFormData({
              ...formData,
              bankDetails: { ...formData.bankDetails, branchName: e.target.value }
            })}
          />
        </div>
      </div>
    </>
  )
}


{/* Items Section (Dynamic) */ }
{
  ["grn", "dc", "po", "billing"].includes(activeTab) && (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-bold text-gray-900">Items</label>
        <button
          type="button"
          onClick={addItem}
          className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {formData.items && formData.items.length > 0 ? (
        <div className="space-y-2">
          {formData.items.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-lg">
              <input
                type="text"
                placeholder="Material Name *"
                className="input-field flex-1"
                required
                value={item.materialName || ""}
                onChange={e => updateItem(idx, "materialName", e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty *"
                className="input-field w-full sm:w-24"
                required
                value={item.quantity || ""}
                onChange={e => updateItem(idx, "quantity", e.target.value)}
              />
              <input
                type="text"
                placeholder="Unit"
                className="input-field w-full sm:w-20"
                value={item.unit || "PCS"}
                onChange={e => updateItem(idx, "unit", e.target.value)}
              />
              {(activeTab === "po" || activeTab === "billing") && (
                <>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    className="input-field w-full sm:w-24"
                    value={item.rate || ""}
                    onChange={e => updateItem(idx, "rate", e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    className="input-field w-full sm:w-28"
                    value={item.amount || ""}
                    readOnly
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No items added. Click "Add Item" to start.</p>
      )}
    </div>
  )
}

<div className="flex justify-end gap-3 pt-4">
  <button
    type="button"
    onClick={() => {
      setShowForm(false);
      setFormData({ items: [] });
      setPhotos([]);
    }}
    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-colors"
  >
    Submit
  </button>
</div>
        </form >
      </div >
    );
  };

const handleEdit = (item: any) => {
  setFormData({ ...item });
  setShowForm(true);
};

const handleDelete = async (id: string) => {
  // ... (existing handleDelete logic)
  if (!confirm("Are you sure you want to delete this record?")) return;
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    let endpoint = "";
    if (activeTab === "masters") {
      endpoint = `/api/store/${masterTab}/${id}`;
      if (masterTab === "material") endpoint = `/api/store/inventory/${id}`;
    } else if (activeTab === "dc") {
      endpoint = `/api/store/dc/${id}`;
    }
    // Add other delete endpoints as needed

    if (endpoint) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Record deleted successfully");
      fetchData();
      fetchMasters();
    }
  } catch (err: any) {
    setError(err.message || "Failed to delete");
  }
};

const handleDownloadExcel = () => {
  if (activeTab !== "masters" || (masterTab !== "vendor" && masterTab !== "customer")) return;

  const exportData = filteredData.map((item) => {
    const baseData = {
      Name: item.name,
      Code: item.code,
      Contact: item.contactPerson,
      Phone: item.phone,
      Email: item.email,
      GST: item.gst,
      Address: item.address,
    };

    if (masterTab === "customer") {
      return {
        ...baseData,
        "Billing Address": item.billingAddress || "",
        "Shipping Address": item.shippingAddress || "",
        "Account Number": item.bankDetails?.accountNumber || "",
        "IFSC Code": item.bankDetails?.ifscCode || "",
        "Bank Name": item.bankDetails?.bankName || "",
        "Branch Name": item.bankDetails?.branchName || "",
      };
    }

    return {
      ...baseData,
      "Account Number": item.bankDetails?.accountNumber || "",
      "IFSC Code": item.bankDetails?.ifscCode || "",
      "Bank Name": item.bankDetails?.bankName || "",
      "Branch Name": item.bankDetails?.branchName || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, masterTab === "vendor" ? "Vendors" : "Customers");
  XLSX.writeFile(wb, `${masterTab === "vendor" ? "Vendor" : "Customer"}_List.xlsx`);
};

const handleDownloadPDF = () => {
  if (activeTab !== "masters" || (masterTab !== "vendor" && masterTab !== "customer")) return;

  const doc = new jsPDF();
  doc.text(`${masterTab === "vendor" ? "Vendor" : "Customer"} List`, 14, 15);

  const tableColumn = ["Name", "Code", "Contact", "Phone", "Email", "GST"];
  const tableRows = filteredData.map((item) => [
    item.name,
    item.code,
    item.contactPerson,
    item.phone,
    item.email,
    item.gst,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`${masterTab === "vendor" ? "Vendor" : "Customer"}_List.pdf`);
};

// --- TABLE RENDERING ---
const renderTable = () => {
  if (loading) return <LoadingSpinner />;
  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No records found</h3>
        <p className="text-gray-500 mt-1">Create a new record to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Export Buttons for Vendor and Customer Tab */}
      {activeTab === "masters" && (masterTab === "vendor" || masterTab === "customer") && (
        <div className="p-4 flex gap-2 justify-end border-b border-gray-100">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Download Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
            <tr>
              {activeTab === "home" && (
                <>
                  <th className="px-6 py-4">Material Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Location</th>
                </>
              )}
              {activeTab === "masters" && masterTab === "vendor" && (
                <>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">GST</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </>
              )}
              {/* Customer headers */}
              {activeTab === "masters" && masterTab === "customer" && (
                <>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">GST</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </>
              )}
              {/* Location and Material headers */}
              {activeTab === "masters" && masterTab === "location" && (
                <>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </>
              )}
              {activeTab === "masters" && masterTab === "category" && (
                <>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </>
              )}
              {/* ... (Existing headers for other tabs) ... */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {activeTab === "home" && (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.materialName}</td>
                    <td className="px-6 py-4 text-gray-500">{item.materialCode}</td>
                    <td className={`px-6 py-4 font-medium ${item.currentStock <= item.reorderLevel ? "text-red-600" : "text-green-600"}`}>
                      {item.currentStock}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-gray-500">{item.location || "-"}</td>
                  </>
                )}
                {activeTab === "masters" && masterTab === "vendor" && (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.code}</td>
                    <td className="px-6 py-4 text-gray-500">{item.contactPerson} <br /><span className="text-xs">{item.phone}</span></td>
                    <td className="px-6 py-4 text-gray-500">{item.email}</td>
                    <td className="px-6 py-4 text-gray-500">{item.gst}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {/* Customer rows */}
                {activeTab === "masters" && masterTab === "customer" && (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.code}</td>
                    <td className="px-6 py-4 text-gray-500">{item.contactPerson} <br /><span className="text-xs">{item.phone}</span></td>
                    <td className="px-6 py-4 text-gray-500">{item.email}</td>
                    <td className="px-6 py-4 text-gray-500">{item.gst}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {/* Location rows */}
                {activeTab === "masters" && masterTab === "location" && (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.code}</td>
                    <td className="px-6 py-4 text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {/* Category rows */}
                {activeTab === "masters" && masterTab === "category" && (
                  <>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.code}</td>
                    <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {/* ... (Existing rows for other tabs) ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

return (
  <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {renderHeader()}
      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

      {renderTabs()}
      {renderSearch()}
      {renderForm()}
      {renderTable()}
    </div>

    {/* CSS for Input Fields */}
    <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
  </div>
);
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
      <StoreContent />
    </Suspense>
  );
} 