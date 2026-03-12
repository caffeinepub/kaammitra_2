import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    id: bigint;
    name: string;
}
export interface Job {
    id: bigint;
    deleted: boolean;
    postedBy: string;
    createdAt: bigint;
    description: string;
    approved: boolean;
    category: string;
    payOffered: string;
    location: string;
}
export interface Worker {
    id: bigint;
    expectedSalary: string;
    blocked: boolean;
    name: string;
    createdAt: bigint;
    experience: string;
    approved: boolean;
    category: string;
    location: string;
}
export interface Notification {
    id: bigint;
    title: string;
    createdAt: bigint;
    message: string;
}
export interface Contact {
    id: bigint;
    name: string;
    createdAt: bigint;
    message: string;
    phone: string;
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    adminUpdateJob(id: bigint, category: string, location: string, description: string, payOffered: string, postedBy: string): Promise<boolean>;
    adminUpdateWorker(id: bigint, name: string, experience: string, location: string, expectedSalary: string, category: string): Promise<boolean>;
    approveJob(id: bigint): Promise<boolean>;
    approveWorker(id: bigint): Promise<boolean>;
    blockWorker(id: bigint): Promise<boolean>;
    changeAdminCredentials(oldPassword: string, newUsername: string, newPassword: string): Promise<boolean>;
    changeAdminPassword(oldPassword: string, newPassword: string): Promise<boolean>;
    checkAdminCredentials(username: string, password: string): Promise<boolean>;
    resetAdminToDefault(): Promise<void>;
    resetAdminPasswordDirect(newPassword: string): Promise<void>;
    checkAdminPassword(password: string): Promise<boolean>;
    createJob(category: string, location: string, description: string, payOffered: string, postedBy: string): Promise<Job>;
    createWorker(name: string, experience: string, location: string, expectedSalary: string, category: string): Promise<Worker>;
    deleteCategory(id: bigint): Promise<boolean>;
    deleteJob(id: bigint): Promise<boolean>;
    getAllContacts(): Promise<Array<Contact>>;
    getAllJobs(): Promise<Array<Job>>;
    getAllWorkers(): Promise<Array<Worker>>;
    getAppContent(): Promise<{
        supportDetails: string;
        homeText: string;
        bannerText: string;
        announcement: string;
        contactNumber: string;
    }>;
    getCategories(): Promise<Array<Category>>;
    getJobsByCategory(category: string): Promise<Array<Job>>;
    getJobsByLocation(location: string): Promise<Array<Job>>;
    getNotifications(): Promise<Array<Notification>>;
    getWorkersByCategory(category: string): Promise<Array<Worker>>;
    getWorkersByLocation(location: string): Promise<Array<Worker>>;
    seed(): Promise<void>;
    sendNotification(title: string, message: string): Promise<void>;
    submitContact(name: string, phone: string, message: string): Promise<Contact>;
    unblockWorker(id: bigint): Promise<boolean>;
    updateAppContent(homeText: string, bannerText: string, announcement: string, contactNumber: string, supportDetails: string): Promise<void>;
    updateCategory(id: bigint, name: string): Promise<boolean>;
}
