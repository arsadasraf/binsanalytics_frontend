/**
 * CompanyInfoForm Component
 * 
 * Form to manage company information for PO documents.
 * Includes fields for company details, addresses, and terms.
 */

import React, { useState, useEffect } from 'react';
import { Save, Upload, Building2, Phone, Mail, FileText, MapPin } from 'lucide-react';
import { CompanyInfo } from '../../types/store.types';

interface CompanyInfoFormProps {
    initialData?: CompanyInfo;
    onSubmit: (data: CompanyInfo) => void;
    loading: boolean;
}

export default function CompanyInfoForm({ initialData, onSubmit, loading }: CompanyInfoFormProps) {
    const [formData, setFormData] = useState<CompanyInfo>({
        companyName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        logo: '',
        gstNumber: '',
        billingAddress: '',
        shippingAddress: '',
        qualitySpecs: '',
        commercialTerms: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 size={24} />
                        Company Information
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Manage your company details for Purchase Orders and documents
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-75"
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Basic Info & Logo */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            Basic Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="GSTIN"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="text"
                                        name="logo"
                                        value={formData.logo || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Phone size={20} className="text-blue-600" />
                            Contact Information
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    required
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Name of contact person"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        required
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+91..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="email@company.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Addresses & Terms */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-blue-600" />
                            Addresses
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                                <textarea
                                    name="billingAddress"
                                    required
                                    rows={3}
                                    value={formData.billingAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter billing address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                <textarea
                                    name="shippingAddress"
                                    required
                                    rows={3}
                                    value={formData.shippingAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter shipping address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Terms & Specifications
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quality & Specifications</label>
                                <textarea
                                    name="qualitySpecs"
                                    rows={3}
                                    value={formData.qualitySpecs || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Standard quality specs..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Terms</label>
                                <textarea
                                    name="commercialTerms"
                                    rows={3}
                                    value={formData.commercialTerms || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Payment terms, delivery terms..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
