// profile-kit — shared by PROchure-sales and PROchure.app-admin. Keep both copies identical.
import type { ProfileType } from "./types";

export const PROFILE_TYPE_OPTIONS: { value: ProfileType; label: string }[] = [
    { value: "PROFESSIONAL_CONSULTANT", label: "Professional Consultants" },
    { value: "SERVICE_AND_RETAIL_BRANDS", label: "Service & Retail Brands" },
];

export const PROFILE_TYPE_LABEL: Record<ProfileType, string> = {
    PROFESSIONAL_CONSULTANT: "Professional Consultants",
    SERVICE_AND_RETAIL_BRANDS: "Service & Retail Brands",
};

export const LANGUAGES = [
    "English", "Hindi", "Vernacular",
];

export const COUNTRY_CODES = [
    { code: "+91", label: "IN +91" },
    { code: "+971", label: "AE +971" },
    { code: "+966", label: "SA +966" },
    { code: "+974", label: "QA +974" },
    { code: "+968", label: "OM +968" },
    { code: "+965", label: "KW +965" },
    { code: "+973", label: "BH +973" },
    { code: "+1", label: "US/CA +1" },
    { code: "+44", label: "UK +44" },
    { code: "+61", label: "AU +61" },
    { code: "+65", label: "SG +65" },
    { code: "+60", label: "MY +60" },
    { code: "+49", label: "DE +49" },
    { code: "+33", label: "FR +33" },
    { code: "+977", label: "NP +977" },
    { code: "+94", label: "LK +94" },
    { code: "+880", label: "BD +880" },
];

export const MAX_CONTACTS = 3;

export const ADDRESS_FIELDS = [
    { key: "buildingMallPropertyName", label: "Building / Mall / Property Name", required: false, max: 200 },
    { key: "doorShopNo", label: "Door / Shop No.", required: false, max: 50 },
    { key: "floor", label: "Floor", required: false, max: 50 },
    { key: "streetLaneRoadNameSubLocality", label: "Street / Lane / Road / Sub-Locality", required: false, max: 200 },
    { key: "nearestLandmark", label: "Nearest Landmark", required: false, max: 200 },
    { key: "secondaryPrimaryLocality", label: "Secondary / Primary Locality", required: false, max: 200 },
    { key: "cityTown", label: "City / Town", required: true, max: 100 },
    { key: "stateProvince", label: "State / Province", required: true, max: 100 },
    { key: "country", label: "Country", required: true, max: 100 },
    { key: "pinCodeZipCode", label: "PIN / ZIP Code", required: false, max: 20 },
] as const;

/** Labels shown on the card and the form, per profile variant. */
export interface VariantLabels {
    name: string;
    since: string;
    sinceShort: string;
    services: string;
    address: string;
    hours: string;
}

export function variantLabels(type: ProfileType, kind?: string | null): VariantLabels {
    if (type === "SERVICE_AND_RETAIL_BRANDS") {
        return {
            name: "Name of Service / Retail Brand",
            since: "Serving since / Established in",
            sinceShort: "Serving since",
            services: "Services offered / Product line",
            address: "Business / Outlet address",
            hours: "Operational / Business days & hours",
        };
    }
    const consultancy = kind === "CONSULTANCY";
    return {
        name: consultancy ? "Name of Entity" : "Name",
        since: consultancy ? "Established in" : "Practicing since",
        sinceShort: consultancy ? "Established in" : "Practicing since",
        services: "Services offered / Areas of practice",
        address: "Office address",
        hours: "Working days & hours",
    };
}
