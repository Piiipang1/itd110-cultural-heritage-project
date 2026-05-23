export type Custodian = {
    id?: string;
    name: string;
    type: string; // e.g. Government, NGO, Private, Community
    contactEmail: string;
    contactPhone: string;
    address: string;
    description: string;
    establishedYear: string;
    createdBy?: string;
    createdAt?: any;
};
