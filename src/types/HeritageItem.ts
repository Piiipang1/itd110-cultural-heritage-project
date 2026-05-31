import type { Timestamp } from "firebase/firestore";

export type HeritageItem = {
    id?: string;
    name: string;
    type: string;
    origin?: string;
    yearOfRecognition?: string;
    province: string;
    municipality: string;
    latitude: string;
    longitude: string;
    description: string;
    culturalSignificance: string;
    preservationStatus: string;
    imageUrl: string;
    createdBy?: string;
    createdAt?: Timestamp | null;
    custodianId?: string;
    festivalIds?: string[];
    relatedHeritageIds?: string[];
};