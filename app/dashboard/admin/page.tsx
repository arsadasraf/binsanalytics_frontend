"use client";

import { useState } from "react";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/src/store/services/userService";

interface User {
  _id: string;
  name: string;
  userId: string;
  email: string;
  department: string;
  roleLevel: number;
}

export default function AdminDashboard() {
  const { data: users = [], isFetching, refetch } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    email: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createUser(formData).unwrap();
      setSuccess("User created successfully!");
      resetForm();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to create user. Please try again.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editingUser) return;

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
      };
      
      // Only include password if it's not empty
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      await updateUser({ id: editingUser._id, body: updateData }).unwrap();
      setSuccess("User updated successfully!");
      resetForm();
      refetch();
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await deleteUser(userId).unwrap();
      setSuccess("User deleted successfully!");
      setError("");
      refetch();
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to delete user. Please try again.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      userId: user.userId,
      email: user.email,
      password: "", // Don't pre-fill password
      department: user.department,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({ name: "", userId: "", email: "", password: "", department: "" });
    setEditingUser(null);
    setShowForm(false);
  };

  const departments = [
    "HR",
    "Store",
    "Accounts",
    "PPC",
    "Manager",
    "Supervisor",
    "Operator",
    "TeamLeader",
    "MD",
    "CEO",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage users with role-based access</p>
          </div>
          <button
            onClick={() => {
              // resetForm();
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {showForm ? "Cancel" : "+ Create User"}
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

        {showForm && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingUser ? "Edit User" : "Create New User"}
            </h2>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    disabled={!!editingUser} // Disable User ID editing
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingUser ? "(Leave empty to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? "Enter new password or leave empty" : "Enter password"}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Role *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    HR → HR Dashboard | Store → Store Dashboard | PPC → PPC Dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department/Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFetching ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found. Create your first user!
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.department === "HR" ? "bg-blue-100 text-blue-800" :
                          user.department === "Store" ? "bg-green-100 text-green-800" :
                          user.department === "PPC" ? "bg-orange-100 text-orange-800" :
                          "bg-indigo-100 text-indigo-800"
                        }`}>
                          {user.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
