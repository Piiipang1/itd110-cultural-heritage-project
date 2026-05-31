import type { Timestamp } from "firebase/firestore";

export type Festival = {
    id?: string;
    name: string;
    date: string;
    location: string;
    type: string; // e.g. Religious, Cultural, Historical, Seasonal
    description: string;
    createdBy?: string;
    createdAt?: Timestamp | null;
};
