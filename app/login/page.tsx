"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useLoginMutation } from "@/src/store/services/authService";
import { persistSession } from "@/src/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"company" | "user">("company");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await login({
        type: loginType,
        credentials: { userId, password },
      }).unwrap();

      if (response.token) {
        setSuccess(loginType === "company" ? "Company login successful!" : "User login successful!");
        persistSession({
          token: response.token,
          userType: loginType,
          user: loginType === "user" ? response.user : response.company,
        });

        const redirect = () => {
          if (loginType === "user" && response.user) {
            const department = response.user.department;
            if (department === "HR") {
              router.push("/dashboard/hr");
            } else if (department === "Store") {
              router.push("/dashboard/store");
            } else if (department === "PPC") {
              router.push("/dashboard/ppc");
            } else if (department === "Accounts") {
              router.push("/dashboard/accounts");
            } else {
              router.push("/dashboard");
            }
          } else {
            router.push("/dashboard");
          }
        };

        setTimeout(redirect, 800);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.data?.message || err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => router.push("/")}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" onClick={() => router.push("/")}>BinsAnalytics ERP</h1>
            <p className="text-gray-600">Shop Floor Management System</p>
          </div>

          {/* Login Type Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginType("company")}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${loginType === "company"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Company Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType("user")}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${loginType === "user"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                User Login
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {loginType === "company"
                ? "Login as company admin to manage users"
                : "Login with your user credentials"}
            </p>
          </div>

          {error && <ErrorAlert message={error} onClose={() => setError("")} />}
          {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === "company" ? "Company User ID" : "User ID"}
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={loginType === "company" ? "Enter company user ID" : "Enter your user ID"}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Register Company
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure login • Role-based access • Shop floor management
        </p>
      </div>
    </div>
  );
}
