// profile-kit — shared by PROchure-sales and PROchure.app-admin. Keep both copies identical.
import { ADDRESS_FIELDS, CORE_SERVICES_MAX, COUNTRY_CODES, MAX_CONTACTS, SERVICES_DETAIL_MAX } from "./constants";
import type {
    ConsultantKind,
    DaySchedule,
    ProfileAddress,
    ProfileCardData,
    ProfilePayload,
    ProfileType,
    WorkingHours,
} from "./types";

// ─── Display helpers ─────────────────────────────────────────────────────────

export function formatTime(hhmm?: string | null): string {
    if (!hhmm) return "";
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function formatSchedule(day?: Partial<DaySchedule> | null): string {
    if (!day) return "";
    if (day.closed) return "Holiday";
    if (!day.open || !day.close) return "";
    if (day.breakStart && day.breakEnd) {
        return `${formatTime(day.open)} – ${formatTime(day.breakStart)}, ${formatTime(day.breakEnd)} – ${formatTime(day.close)}`;
    }
    return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

export function workingHoursLines(wh?: Partial<WorkingHours> | null): { label: string; text: string }[] {
    if (!wh) return [];
    return [
        { label: "Mon – Fri", text: formatSchedule(wh.weekdays) },
        { label: "Saturday", text: formatSchedule(wh.saturday) },
        { label: "Sunday", text: formatSchedule(wh.sunday) },
    ].filter((l) => l.text);
}

export function addressLines(a?: Partial<ProfileAddress> | null): string[] {
    if (!a) return [];
    const join = (parts: (string | null | undefined)[], sep = ", ") => parts.filter((p) => p && p.trim()).join(sep);
    return [
        join([a.doorShopNo, a.floor && !/floor/i.test(a.floor) ? `${a.floor} Floor` : a.floor, a.buildingMallPropertyName]),
        join([a.streetLaneRoadNameSubLocality, a.secondaryPrimaryLocality]),
        a.nearestLandmark ? `Near ${a.nearestLandmark}` : "",
        join([join([a.cityTown, a.pinCodeZipCode], " – "), a.stateProvince, a.country]),
    ].filter(Boolean);
}

export function splitPhone(e164?: string | null): { code: string; number: string } {
    const v = (e164 ?? "").replace(/\s+/g, "");
    const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => v.startsWith(c.code));
    if (match) return { code: match.code, number: v.slice(match.code.length) };
    return { code: "+91", number: v.replace(/^\+/, "") };
}

export function formatPhone(e164?: string | null): string {
    const { code, number } = splitPhone(e164);
    if (!number) return "";
    return code === "+91" && number.length === 10 ? `${code} ${number.slice(0, 5)} ${number.slice(5)}` : `${code} ${number}`;
}

// ─── Form state ─────────────────────────────────────────────────────────────

export interface PhoneInput {
    code: string;
    number: string;
}

export type AddressValues = Record<(typeof ADDRESS_FIELDS)[number]["key"], string>;

export interface ProfileFormValues {
    /** Category type (group) — UI only, used to filter categories */
    categoryGroupId: string;
    categoryId: string;
    subCategoryId: string;
    consultantKind: ConsultantKind | "";
    name: string;
    consultantName: string;
    degrees: string;
    registrationNumber: string;
    servicesOffered: string;
    servicesDetail: string;
    sinceYear: string;
    isWomenEntrepreneur: boolean;
    phones: PhoneInput[];
    emails: string[];
    address: AddressValues;
    workingHours: WorkingHours;
    languages: string[];
}

const day = (closed = false): DaySchedule => ({
    closed,
    open: closed ? "" : "09:00",
    close: closed ? "" : "18:00",
    breakStart: "",
    breakEnd: "",
});

const emptyAddress = (): AddressValues =>
    Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.key, f.key === "country" ? "India" : ""])) as AddressValues;

export function emptyFormValues(prefill: { phone?: string; email?: string } = {}): ProfileFormValues {
    return {
        categoryGroupId: "",
        categoryId: "",
        subCategoryId: "",
        consultantKind: "",
        name: "",
        consultantName: "",
        degrees: "",
        registrationNumber: "",
        servicesOffered: "",
        servicesDetail: "",
        sinceYear: "",
        isWomenEntrepreneur: false,
        phones: [prefill.phone ? splitPhone(prefill.phone) : { code: "+91", number: "" }],
        emails: [prefill.email ?? ""],
        address: emptyAddress(),
        workingHours: { weekdays: day(), saturday: day(), sunday: day(true) },
        languages: [],
    };
}

/** Converts a profile returned by the API into form values. */
export function toFormValues(
    p: Omit<Partial<ProfilePayload>, "subCategoryId" | "servicesDetail"> & {
        subCategoryId?: string | null;
        servicesDetail?: string | null;
        category?: { groupId?: string | null } | null;
    },
): ProfileFormValues {
    const base = emptyFormValues();
    const normDay = (d?: Partial<DaySchedule> | null, fallback = day()): DaySchedule =>
        d
            ? {
                  closed: !!d.closed,
                  open: d.open ?? "",
                  close: d.close ?? "",
                  breakStart: d.breakStart ?? "",
                  breakEnd: d.breakEnd ?? "",
              }
            : fallback;
    return {
        categoryGroupId: p.category?.groupId ?? "",
        categoryId: p.categoryId ?? "",
        subCategoryId: p.subCategoryId ?? "",
        consultantKind: p.consultantKind ?? "",
        name: p.name ?? "",
        consultantName: p.consultantName ?? "",
        degrees: p.degrees ?? "",
        registrationNumber: p.registrationNumber ?? "",
        servicesOffered: p.servicesOffered ?? "",
        servicesDetail: p.servicesDetail ?? "",
        sinceYear: p.sinceYear ?? "",
        isWomenEntrepreneur: !!p.isWomenEntrepreneur,
        phones: p.contactNumbers?.length ? p.contactNumbers.map(splitPhone) : base.phones,
        emails: p.emails?.length ? [...p.emails] : base.emails,
        address: { ...base.address, ...Object.fromEntries(Object.entries(p.address ?? {}).map(([k, v]) => [k, v ?? ""])) },
        workingHours: {
            weekdays: normDay(p.workingHours?.weekdays),
            saturday: normDay(p.workingHours?.saturday),
            sunday: normDay(p.workingHours?.sunday, day(true)),
        },
        languages: p.languages ?? [],
    };
}

const phoneToE164 = (p: PhoneInput) => (p.number.replace(/\D/g, "") ? `${p.code}${p.number.replace(/\D/g, "")}` : "");
const t = (s: string) => s.trim();
const opt = (s: string) => t(s) || undefined;

function cleanDay(d: DaySchedule): DaySchedule {
    if (d.closed) return { closed: true, open: null, close: null, breakStart: null, breakEnd: null };
    const hasBreak = !!d.breakStart && !!d.breakEnd;
    return {
        closed: false,
        open: d.open || null,
        close: d.close || null,
        breakStart: hasBreak ? d.breakStart : null,
        breakEnd: hasBreak ? d.breakEnd : null,
    };
}

export function toPayload(type: ProfileType, v: ProfileFormValues): ProfilePayload {
    const consultant = type === "PROFESSIONAL_CONSULTANT";
    const independent = consultant && v.consultantKind === "INDEPENDENT";
    return {
        profileType: type,
        categoryId: v.categoryId,
        subCategoryId: v.subCategoryId || undefined,
        consultantKind: consultant ? (v.consultantKind as ConsultantKind) : undefined,
        name: t(v.name),
        consultantName: consultant && v.consultantKind === "CONSULTANCY" ? opt(v.consultantName) : undefined,
        degrees: independent ? opt(v.degrees) : undefined,
        registrationNumber: independent ? opt(v.registrationNumber) : undefined,
        servicesOffered: t(v.servicesOffered),
        servicesDetail: opt(v.servicesDetail),
        sinceYear: t(v.sinceYear),
        isWomenEntrepreneur: v.isWomenEntrepreneur,
        contactNumbers: v.phones.map(phoneToE164).filter(Boolean),
        emails: v.emails.map((e) => t(e).toLowerCase()).filter(Boolean),
        address: Object.fromEntries(Object.entries(v.address).map(([k, val]) => [k, t(val)])) as unknown as ProfileAddress,
        workingHours: {
            weekdays: cleanDay(v.workingHours.weekdays),
            saturday: cleanDay(v.workingHours.saturday),
            sunday: cleanDay(v.workingHours.sunday),
        },
        languages: v.languages,
    };
}

export function toCardData(type: ProfileType, v: ProfileFormValues): ProfileCardData {
    const p = toPayload(type, v);
    return { ...p, consultantKind: v.consultantKind || null };
}

// ─── Validation (mirrors the server rules) ──────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

export type FormErrors = Partial<Record<string, string>>;

export function validateProfile(
    type: ProfileType,
    v: ProfileFormValues,
    needsSubCategory: boolean,
    needsCategoryGroup = false,
): FormErrors {
    const e: FormErrors = {};
    const consultant = type === "PROFESSIONAL_CONSULTANT";
    const year = parseInt(v.sinceYear, 10);

    if (needsCategoryGroup && !v.categoryGroupId) e.categoryGroupId = "Select a category type";
    if (!v.categoryId) e.categoryId = "Select a category";
    if (needsSubCategory && !v.subCategoryId) e.subCategoryId = "Select a subcategory";
    if (consultant && !v.consultantKind) e.consultantKind = "Choose Independent Professional or Professional Consultancy";
    if (t(v.name).length < 2) e.name = "This field is required";
    if (consultant && v.consultantKind === "INDEPENDENT" && t(v.degrees).length < 2) e.degrees = "Degrees are required";
    if (t(v.servicesOffered).length < 2) e.servicesOffered = "This field is required";
    else if (t(v.servicesOffered).length > CORE_SERVICES_MAX) {
        e.servicesOffered = `Keep this to ${CORE_SERVICES_MAX} characters — add the rest in the detailed field below`;
    }
    if (t(v.servicesDetail).length > SERVICES_DETAIL_MAX) e.servicesDetail = `Up to ${SERVICES_DETAIL_MAX} characters`;
    if (!/^(19|20)\d{2}$/.test(t(v.sinceYear)) || year > new Date().getFullYear()) e.sinceYear = "Enter a valid 4-digit year";

    const phones = v.phones.map(phoneToE164);
    if (!phones.some(Boolean)) e["phones.0"] = "At least one contact number is required";
    phones.forEach((p, i) => {
        if (p && !E164_RE.test(p)) e[`phones.${i}`] = "Enter a valid mobile number";
    });
    if (v.phones.length > MAX_CONTACTS) e["phones.0"] = `Up to ${MAX_CONTACTS} numbers`;

    const emails = v.emails.map(t);
    if (!emails.some(Boolean)) e["emails.0"] = "At least one email ID is required";
    emails.forEach((m, i) => {
        if (m && !EMAIL_RE.test(m)) e[`emails.${i}`] = "Enter a valid email";
    });

    for (const f of ADDRESS_FIELDS) {
        if (f.required && !t(v.address[f.key])) e[`address.${f.key}`] = "Required";
    }

    (["weekdays", "saturday", "sunday"] as const).forEach((k) => {
        const d = v.workingHours[k];
        if (d.closed) return;
        if (!d.open || !d.close) e[`workingHours.${k}`] = "Enter opening and closing time";
        else if (d.open >= d.close) e[`workingHours.${k}`] = "Closing time must be after opening time";
        else if (d.breakStart || d.breakEnd) {
            if (!d.breakStart || !d.breakEnd) e[`workingHours.${k}`] = "Enter both lunch break times";
            else if (!(d.open < d.breakStart && d.breakStart < d.breakEnd && d.breakEnd < d.close)) {
                e[`workingHours.${k}`] = "Lunch break must be within working hours";
            }
        }
    });

    if (!v.languages.length) e.languages = "Select at least one language";
    return e;
}
