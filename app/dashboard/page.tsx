"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useGetCompanyProfileQuery } from "@/src/store/services/companyService";
import { clearSession } from "@/src/lib/session";

export default function Dashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shouldFetchProfile, setShouldFetchProfile] = useState(false);
  const { data, isFetching } = useGetCompanyProfileQuery(undefined, {
    skip: !shouldFetchProfile,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userType === "user") {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        const department = user.department;

        if (department === "HR") {
          router.push("/dashboard/hr");
        } else if (department === "Store") {
          router.push("/dashboard/store");
        } else if (department === "PPC") {
          router.push("/dashboard/ppc");
        } else if (department === "Accounts") {
          router.push("/dashboard/accounts");
        }
      }
      setLoading(false);
      return;
    }

    setShouldFetchProfile(true);
  }, []);

  useEffect(() => {
    if (data) {
      setUserInfo(data);
    }
    if (!isFetching && shouldFetchProfile) {
      setLoading(false);
    }
  }, [data, isFetching, shouldFetchProfile]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const dashboardCards = [
    {
      title: "User Management",
      description: "Create and manage users with different roles (HR, Store, PPC, etc.)",
      href: "/dashboard/admin",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "HR Management",
      description: "Manage employees, attendance with face recognition, and skills",
      href: "/dashboard/hr",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Store Management",
      description: "Manage inventory, GRN (with photos), DC, Invoice, Material Issues",
      href: "/dashboard/store",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "PPC Management",
      description: "Production planning, orders, route cards, jobs, and auto-scheduling",
      href: "/dashboard/ppc",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Accounts",
      description: "Manage finances, transactions, and accounting",
      href: "/dashboard/accounts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Reports",
      description: "View analytics, generate reports, and insights",
      href: "/dashboard/reports",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            {userInfo && (
              <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      Welcome Back!
                    </h2>
                    <p className="text-indigo-100 text-sm md:text-base font-medium opacity-90">
                      {userInfo.companyName}
                    </p>
                  </div>
                  <div className="md:hidden">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xl">👋</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl"></div>
              </div>
            )}

            {/* Dashboard Cards */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Modules</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {dashboardCards.map((card, index) => (
                  <Link
                    key={index}
                    href={card.href}
                    className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-all duration-200"
                  >
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mb-3 ${card.textColor} shadow-inner`}>
                      {card.icon}
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-lg mb-1 leading-tight">
                        {card.title}
                      </h3>
                      <p className="hidden md:block text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
