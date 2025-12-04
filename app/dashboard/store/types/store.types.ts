/**
 * Type definitions for Store Dashboard
 * Contains all TypeScript interfaces and types used across store components
 */

// Tab type for main navigation
export type TabType = "home" | "material-issue" | "grn" | "dc" | "billing" | "po" | "masters";

// Master data type for master tab navigation
export type MasterType = "vendor" | "customer" | "location" | "category" | "material" | "grn-history";

// Bank Details interface for vendors and customers
export interface BankDetails {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
}

// Item interface for transaction items (GRN, DC, PO, Billing)
export interface Item {
    materialName: string;
    quantity: string | number;
    unit: string;
    rate?: string | number;
}

// Form data interface - flexible to accommodate all form types
export interface FormData {
    _id?: string;
    items?: Item[];

    // Master fields
    name?: string;
    code?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gst?: string;
    address?: string;
    billingAddress?: string;  // For customer
    shippingAddress?: string;  // For customer
    description?: string;
    unit?: string;
    categoryId?: string;  // For material master
    bankDetails?: BankDetails;  // For vendor and customer

    // Transaction fields
    grnNumber?: string;
    dcNumber?: string;
    poNumber?: string;
    invoiceNumber?: string;
    issueNumber?: string;
    vendorId?: string;
    customerId?: string;
    date?: string;
    totalAmount?: string | number;
}

// Master data interfaces
export interface Vendor {
    _id: string;
    name: string;
    code?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gst?: string;
    address?: string;
    bankDetails?: BankDetails;
}

export interface Customer {
    _id: string;
    name: string;
    code?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    gst?: string;
    address?: string;
    billingAddress?: string;
    shippingAddress?: string;
    bankDetails?: BankDetails;
}

export interface Location {
    _id: string;
    name: string;
    code?: string;
    description?: string;
}

export interface Category {
    _id: string;
    name: string;
    code?: string;
    unit?: string;
}

export interface Material {
    _id: string;
    name: string;
    code?: string;
    categoryId: string;
    category?: Category;  // Populated category data
}

// Inventory item interface
export interface InventoryItem {
    _id: string;
    materialName: string;
    materialCode: string;
    currentStock: number;
    reorderLevel: number;
    unit: string;
    locationId?: string;
    categoryId?: string;
    location?: Location;  // Populated location data
    category?: Category;  // Populated category data
}

// Transaction interfaces
export interface Transaction {
    _id: string;
    grnNumber?: string;
    dcNumber?: string;
    poNumber?: string;
    invoiceNumber?: string;
    issueNumber?: string;
    date: string;
    items?: Item[];
    vendorId?: string;
    customerId?: string;
    totalAmount?: number;
}

// GRN Form Data for new workflow
export interface GRNFormData {
    _id?: string; // Added for edit mode
    grnNumber?: string;  // Auto-generated
    date: string;
    material: string;  // Material ID from master (not inventory)
    materialName?: string;
    quantity: number;
    unit?: string;  // Auto-filled from material's category
    supplier: string;
    locationId: string;
    category?: string;  // Auto-filled from material's category
}

// Props interfaces for components
export interface StoreHeaderProps {
    // No props needed - static content
}

export interface MasterTabsProps {
    masterTab: MasterType;
    setMasterTab: (tab: MasterType) => void;
}

export interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export interface StoreFormProps {
    activeTab: TabType;
    masterTab: MasterType;
    showForm: boolean;
    formData: FormData;
    setFormData: (data: FormData) => void;
    editingId: string | null;
    loading: boolean;
    vendors: Vendor[];
    customers: Customer[];
    locations: Location[];
    categories: Category[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    addItem: () => void;
    updateItem: (idx: number, field: string, value: any) => void;
    removeItem: (idx: number) => void;
}

export interface FormFieldsProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
    masterTab?: MasterType;
    vendors?: Vendor[];
    customers?: Customer[];
}

export interface ItemsListProps {
    items: Item[];
    activeTab: TabType;
    updateItem: (idx: number, field: string, value: any) => void;
    removeItem: (idx: number) => void;
    addItem: () => void;
}

export interface StoreTableProps {
    activeTab: TabType;
    masterTab: MasterType;
    data: any[];
    loading: boolean;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

export interface TableRowActionsProps {
    item: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}

// GRN Modal Props
export interface GRNModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: GRNFormData) => void;
    materials: Material[];  // Changed from inventoryItems
    vendors: Vendor[];
    locations: Location[];
    categories: Category[];  // Still needed for material form
    loading: boolean;
    initialData?: GRNFormData;
    isEditing?: boolean;
}
