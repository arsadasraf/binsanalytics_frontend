"use client";

import React from 'react';

export default function AccountsPage() {
    return (
        <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Accounts Dashboard</h1>
                <p className="text-gray-600 mb-6">
                    The Accounts module is currently under development. Please check back later for updates.
                </p>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-4">
                    <svg
                        className="w-8 h-8 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
