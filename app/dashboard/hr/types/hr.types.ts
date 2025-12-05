export interface Department {
    _id: string;
    name: string;
    company: string;
    createdAt: string;
    updatedAt: string;
}

export interface Designation {
    _id: string;
    name: string;
    company: string;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    contact: string;
    department: string;
    designation: string;
    joiningDate: string;
    status: "Active" | "Inactive" | "Terminated" | "OnLeave";
    photo?: string;
    faceEncoding?: string;
    skills: {
        name: string;
        level: number;
        certified: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
}
