"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ErrorAlert from "@/src/components/ErrorAlert";
import SuccessAlert from "@/src/components/SuccessAlert";
import VerificationCodeInput from "@/src/components/VerificationCodeInput";
import { persistSession } from "@/src/lib/session";

function RegisterStep2Content() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = searchParams.get("companyId");
    const email = searchParams.get("email");

    const [verificationCode, setVerificationCode] = useState("");
    const [form, setForm] = useState({
        userId: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!companyId || !email) {
            router.push("/register/step1");
        }
    }, [companyId, email, router]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleVerificationComplete = async (code: string) => {
        setVerificationCode(code);
        setIsVerified(true);
        setSuccess("Code entered! Now set your credentials to complete registration.");
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setError("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/company/resend-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ companyId }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned an invalid response. Please make sure the backend server is running.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend code");
            }

            setSuccess("Verification code resent to your email!");
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err: any) {
            setError(err.message || "Failed to resend code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/company/register/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyId,
                    verificationCode,
                    userId: form.userId,
                    password: form.password,
                }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned an invalid response. Please make sure the backend server is running.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            if (data.token) {
                persistSession({
                    token: data.token,
                    userType: "company",
                    user: data.company,
                });
            }

            setSuccess("Registration completed successfully! Redirecting...");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!companyId || !email) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Navbar />
            <main className="flex items-center justify-center py-12 px-6">
                <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {isVerified ? "Set Your Credentials" : "Verify Your Email"}
                        </h2>
                        <p className="text-gray-600">
                            {isVerified ? "Step 2: Create your login credentials" : `Step 2: Enter the code sent to ${email}`}
                        </p>
                        <div className="flex items-center justify-center mt-4 space-x-2">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                            <div className="w-16 h-1 bg-indigo-600"></div>
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        </div>
                    </div>

                    {!isVerified ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                    Enter Verification Code
                                </label>
                                <VerificationCodeInput
                                    length={6}
                                    onComplete={handleVerificationComplete}
                                    disabled={isLoading}
                                />
                            </div>

                            {error && <ErrorAlert message={error} onClose={() => setError("")} />}
                            {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

                            <div className="text-center">
                                <button
                                    onClick={handleResendCode}
                                    disabled={isLoading || resendCooldown > 0}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {resendCooldown > 0
                                        ? `Resend code in ${resendCooldown}s`
                                        : "Didn't receive the code? Resend"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User ID *
                                </label>
                                <input
                                    type="text"
                                    name="userId"
                                    placeholder="Choose a unique user ID"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                    value={form.userId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password (min 6 characters)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {error && <ErrorAlert message={error} onClose={() => setError("")} />}
                            {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Completing Registration...</span>
                                    </>
                                ) : (
                                    "Complete Registration"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function RegisterStep2() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <RegisterStep2Content />
        </Suspense>
    );
}
