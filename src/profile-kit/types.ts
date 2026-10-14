// profile-kit — shared by PROchure-sales and PROchure.app-admin. Keep both copies identical.

export type ProfileType = "PROFESSIONAL_CONSULTANT" | "SERVICE_AND_RETAIL_BRANDS";
export type ConsultantKind = "INDEPENDENT" | "CONSULTANCY";

export interface DaySchedule {
    closed: boolean;
    /** 24h "HH:mm" */
    open?: string | null;
    close?: string | null;
    breakStart?: string | null;
    breakEnd?: string | null;
}

export interface WorkingHours {
    /** Monday – Friday */
    weekdays: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

export interface ProfileAddress {
    buildingMallPropertyName?: string | null;
    doorShopNo?: string | null;
    floor?: string | null;
    streetLaneRoadNameSubLocality?: string | null;
    nearestLandmark?: string | null;
    secondaryPrimaryLocality?: string | null;
    cityTown: string;
    stateProvince: string;
    country: string;
    pinCodeZipCode?: string | null;
}

/** Body accepted by POST/PUT profile endpoints (ProfileContentDto on the server). */
export interface ProfilePayload {
    profileType: ProfileType;
    categoryId: string;
    subCategoryId?: string;
    consultantKind?: ConsultantKind;
    name: string;
    consultantName?: string;
    degrees?: string;
    registrationNumber?: string;
    servicesOffered: string;
    sinceYear: string;
    isWomenEntrepreneur: boolean;
    contactNumbers: string[];
    emails: string[];
    address: ProfileAddress;
    workingHours: WorkingHours;
    languages: string[];
}

/** What the visiting card needs. Matches the public profile API (all fields may be partial while typing). */
export interface ProfileCardData {
    profileType: ProfileType;
    consultantKind?: ConsultantKind | null;
    name?: string | null;
    consultantName?: string | null;
    degrees?: string | null;
    registrationNumber?: string | null;
    servicesOffered?: string | null;
    sinceYear?: string | null;
    isWomenEntrepreneur?: boolean | null;
    contactNumbers?: string[] | null;
    emails?: string[] | null;
    address?: Partial<ProfileAddress> | null;
    workingHours?: Partial<WorkingHours> | null;
    languages?: string[] | null;
}

export interface CategoryOption {
    id: string;
    name: string;
    isSubCategoryNeeded: boolean;
}

export interface SubCategoryOption {
    id: string;
    name: string;
}
