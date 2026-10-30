// profile-kit — shared by PROchure-sales and PROchure.app-admin. Keep both copies identical.
import { useEffect, useId, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import "./profile-kit.css";
import ProfileCard from "./ProfileCard";
import {
    ADDRESS_FIELDS,
    CORE_SERVICES_MAX,
    COUNTRY_CODES,
    LANGUAGES,
    MAX_CONTACTS,
    SERVICES_DETAIL_MAX,
    variantLabels,
} from "./constants";
import { toCardData, toPayload, validateProfile } from "./format";
import type { FormErrors, ProfileFormValues } from "./format";
import type {
    CategoryGroupOption,
    CategoryOption,
    DaySchedule,
    ProfilePayload,
    ProfileType,
    SubCategoryOption,
    WorkingHours,
} from "./types";

/** Pass stable (module-level or memoised) functions for the loaders and getErrorMessages. */
export interface ProfileFormProps {
    profileType: ProfileType;
    initialValues: ProfileFormValues;
    /** Category types (groups) for the profile type, in display order */
    loadCategoryGroups: (type: ProfileType) => Promise<CategoryGroupOption[]>;
    loadCategories: (type: ProfileType) => Promise<CategoryOption[]>;
    loadSubCategories: (categoryId: string) => Promise<SubCategoryOption[]>;
    /** Throw to show an error; the form stays filled in. */
    onSubmit: (payload: ProfilePayload) => Promise<void>;
    getErrorMessages: (err: unknown) => string[];
    submitLabel: string;
    submittingLabel?: string;
    onCancel?: () => void;
    onDirtyChange?: (dirty: boolean) => void;
    /** Extra content rendered at the top of the form (e.g. owner login fields in the admin panel). */
    header?: ReactNode;
}

export default function ProfileForm({
    profileType,
    initialValues,
    loadCategoryGroups,
    loadCategories,
    loadSubCategories,
    onSubmit,
    getErrorMessages,
    submitLabel,
    submittingLabel = "Saving…",
    onCancel,
    onDirtyChange,
    header,
}: ProfileFormProps) {
    const [values, setValues] = useState<ProfileFormValues>(initialValues);
    const [groups, setGroups] = useState<CategoryGroupOption[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const isConsultant = profileType === "PROFESSIONAL_CONSULTANT";
    const labels = variantLabels(profileType, values.consultantKind || "INDEPENDENT");
    const selectedCategory = categories.find((c) => c.id === values.categoryId);
    const needsSub = !!selectedCategory?.isSubCategoryNeeded;
    const needsGroup = groups.length > 0;
    const groupCategories = needsGroup ? categories.filter((c) => c.groupId === values.categoryGroupId) : categories;
    const errors: FormErrors = showErrors ? validateProfile(profileType, values, needsSub, needsGroup) : {};
    const cardData = useMemo(() => toCardData(profileType, values), [profileType, values]);

    const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [values, initialValues]);
    useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

    useEffect(() => {
        let alive = true;
        Promise.all([loadCategoryGroups(profileType), loadCategories(profileType)])
            .then(([g, c]) => {
                if (!alive) return;
                setGroups(g);
                setCategories(c);
                // Editing an existing profile: preselect the category type of its category
                setValues((v) =>
                    v.categoryGroupId || !v.categoryId
                        ? v
                        : { ...v, categoryGroupId: c.find((x) => x.id === v.categoryId)?.groupId ?? "" },
                );
            })
            .catch((e) => alive && setLoadError(getErrorMessages(e)[0] ?? "Could not load categories"));
        return () => {
            alive = false;
        };
    }, [profileType, loadCategoryGroups, loadCategories, getErrorMessages]);

    useEffect(() => {
        let alive = true;
        if (!values.categoryId) {
            setSubCategories([]);
            return;
        }
        loadSubCategories(values.categoryId)
            .then((s) => alive && setSubCategories(s))
            .catch(() => alive && setSubCategories([]));
        return () => {
            alive = false;
        };
    }, [values.categoryId, loadSubCategories]);

    const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) =>
        setValues((v) => ({ ...v, [key]: value }));
    const setList = (key: "emails", i: number, value: string) =>
        setValues((v) => ({ ...v, [key]: v[key].map((x, j) => (j === i ? value : x)) }));
    const setDay = (k: keyof WorkingHours, patch: Partial<DaySchedule>) =>
        setValues((v) => ({ ...v, workingHours: { ...v.workingHours, [k]: { ...v.workingHours[k], ...patch } } }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setShowErrors(true);
        setServerErrors([]);
        if (Object.keys(validateProfile(profileType, values, needsSub, needsGroup)).length) {
            setServerErrors(["Please fix the highlighted fields."]);
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(toPayload(profileType, values));
        } catch (err) {
            setServerErrors(getErrorMessages(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pk-root pk-form-layout">
            <form className="pk-form" onSubmit={handleSubmit} noValidate>
                {header}

                {/* Category */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">Category</legend>
                    {loadError && <div className="pk-alert">{loadError}</div>}
                    {needsGroup && (
                        <Field label="Category type" required error={errors.categoryGroupId}>
                            {(id) => (
                                <select
                                    id={id}
                                    className="pk-select"
                                    value={values.categoryGroupId}
                                    aria-invalid={!!errors.categoryGroupId}
                                    onChange={(e) =>
                                        setValues((v) => ({ ...v, categoryGroupId: e.target.value, categoryId: "", subCategoryId: "" }))
                                    }
                                >
                                    <option value="">Select a category type</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Field>
                    )}
                    <div className="pk-grid-2">
                        <Field label="Category" required error={errors.categoryId}>
                            {(id) => (
                                <select
                                    id={id}
                                    className="pk-select"
                                    value={values.categoryId}
                                    aria-invalid={!!errors.categoryId}
                                    disabled={needsGroup && !values.categoryGroupId}
                                    onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value, subCategoryId: "" }))}
                                >
                                    <option value="">
                                        {needsGroup && !values.categoryGroupId ? "Select a category type first" : "Select a category"}
                                    </option>
                                    {groupCategories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Field>
                        {(needsSub || subCategories.length > 0) && (
                            <Field label="Sub-category" required={needsSub} error={errors.subCategoryId}>
                                {(id) => (
                                    <select
                                        id={id}
                                        className="pk-select"
                                        value={values.subCategoryId}
                                        aria-invalid={!!errors.subCategoryId}
                                        onChange={(e) => set("subCategoryId", e.target.value)}
                                    >
                                        <option value="">{needsSub ? "Select a sub-category" : "None"}</option>
                                        {subCategories.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                        )}
                    </div>
                </fieldset>

                {/* Card front */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">PROFILE CREATION</legend>

                    {isConsultant && (
                        <div className="pk-field">
                            <span className="pk-label">
                                For <span className="pk-req">*</span>
                            </span>
                            <div className="pk-radio-group" role="radiogroup">
                                {(
                                    [
                                        ["INDEPENDENT", "An INDEPENDENT Professional Consultant"],
                                        ["CONSULTANCY", "A Professional Consultancy ENTITY"],
                                    ] as const
                                ).map(([value, label]) => (
                                    <label key={value} className="pk-choice" data-checked={values.consultantKind === value}>
                                        <input
                                            type="radio"
                                            name="consultantKind"
                                            value={value}
                                            checked={values.consultantKind === value}
                                            onChange={() => set("consultantKind", value)}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {errors.consultantKind && <span className="pk-error">{errors.consultantKind}</span>}
                        </div>
                    )}

                    {(!isConsultant || values.consultantKind) && (
                        <>
                            <Field label={labels.name} required error={errors.name}>
                                {(id) => (
                                    <TextInput id={id} value={values.name} max={150} invalid={!!errors.name} onChange={(v) => set("name", v)} />
                                )}
                            </Field>

                            {isConsultant && values.consultantKind === "INDEPENDENT" && (
                                <div className="pk-grid-2">
                                    <Field label="Degrees" required error={errors.degrees}>
                                        {(id) => (
                                            <TextInput id={id} value={values.degrees} max={200} invalid={!!errors.degrees} onChange={(v) => set("degrees", v)} />
                                        )}
                                    </Field>
                                    <Field label="Statutory Body Registration Number">
                                        {(id) => (
                                            <TextInput id={id} value={values.registrationNumber} max={100} onChange={(v) => set("registrationNumber", v)} />
                                        )}
                                    </Field>
                                </div>
                            )}

                            {isConsultant && values.consultantKind === "CONSULTANCY" && (
                                <Field label="Name (s) of Consultant (s)">
                                    {(id) => (
                                        <TextInput id={id} value={values.consultantName} max={150} onChange={(v) => set("consultantName", v)} />
                                    )}
                                </Field>
                            )}

                            <Field
                                label={labels.services}
                                required
                                error={errors.servicesOffered}
                                hint={`Shown on your card — ${values.servicesOffered.length}/${CORE_SERVICES_MAX} characters`}
                            >
                                {(id) => (
                                    <textarea
                                        id={id}
                                        className="pk-textarea"
                                        rows={2}
                                        maxLength={CORE_SERVICES_MAX}
                                        value={values.servicesOffered}
                                        aria-invalid={!!errors.servicesOffered}
                                        onChange={(e) => set("servicesOffered", e.target.value)}
                                    />
                                )}
                            </Field>

                            <Field
                                label={labels.servicesDetail}
                                error={errors.servicesDetail}
                                hint="Displayed on the profile information page only (optional)"
                            >
                                {(id) => (
                                    <textarea
                                        id={id}
                                        className="pk-textarea"
                                        rows={5}
                                        maxLength={SERVICES_DETAIL_MAX}
                                        value={values.servicesDetail}
                                        aria-invalid={!!errors.servicesDetail}
                                        onChange={(e) => set("servicesDetail", e.target.value)}
                                    />
                                )}
                            </Field>

                            <div className="pk-grid-2">
                                <Field label={labels.since} required error={errors.sinceYear}>
                                    {(id) => (
                                        <input
                                            id={id}
                                            className="pk-input"
                                            inputMode="numeric"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            value={values.sinceYear}
                                            aria-invalid={!!errors.sinceYear}
                                            onChange={(e) => set("sinceYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
                                        />
                                    )}
                                </Field>
                                <div className="pk-field" style={{ alignContent: "end" }}>
                                    <label className="pk-check" style={{ padding: "10px 0" }}>
                                        <input
                                            type="checkbox"
                                            checked={values.isWomenEntrepreneur}
                                            onChange={(e) => set("isWomenEntrepreneur", e.target.checked)}
                                        />
                                        {isConsultant && values.consultantKind === "CONSULTANCY" ? "Owned by a Woman / Women" : "I am a Woman"} {isConsultant ? values.consultantKind === "CONSULTANCY" ? "" : "Consultant" : "Entrepreneur"} (check this box to add the ‘SHE-PRO’ badge on your e-visiting card)
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </fieldset>

                {/* Contact */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">Contact INFORMATION</legend>
                    <div className="pk-field">
                        <span className="pk-label">
                            Contact Number (s) <span className="pk-req">*</span>
                        </span>
                        {values.phones.map((p, i) => (
                            <div key={i} className="pk-field">
                                <div className="pk-row">
                                    <select
                                        aria-label="Country code"
                                        className="pk-select pk-code"
                                        value={p.code}
                                        onChange={(e) => set("phones", values.phones.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))}
                                    >
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c.label} value={c.code}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        aria-label={`Contact number ${i + 1}`}
                                        className="pk-input pk-grow"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={16}
                                        placeholder="9876543210"
                                        value={p.number}
                                        aria-invalid={!!errors[`phones.${i}`]}
                                        onChange={(e) =>
                                            set("phones", values.phones.map((x, j) => (j === i ? { ...x, number: e.target.value.replace(/[^\d\s]/g, "") } : x)))
                                        }
                                    />
                                    {values.phones.length > 1 && (
                                        <button
                                            type="button"
                                            className="pk-icon-btn"
                                            aria-label="Remove number"
                                            onClick={() => set("phones", values.phones.filter((_, j) => j !== i))}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {errors[`phones.${i}`] && <span className="pk-error">{errors[`phones.${i}`]}</span>}
                            </div>
                        ))}
                        {values.phones.length < MAX_CONTACTS && (
                            <button
                                type="button"
                                className="pk-link-btn"
                                onClick={() => set("phones", [...values.phones, { code: values.phones[0]?.code ?? "+91", number: "" }])}
                            >
                                + Add another number
                            </button>
                        )}
                    </div>

                    <div className="pk-field">
                        <span className="pk-label">
                            Email ID (s) <span className="pk-req">*</span>
                        </span>
                        {values.emails.map((m, i) => (
                            <div key={i} className="pk-field">
                                <div className="pk-row">
                                    <input
                                        aria-label={`Email ${i + 1}`}
                                        className="pk-input pk-grow"
                                        type="email"
                                        maxLength={254}
                                        placeholder="name@example.com"
                                        value={m}
                                        aria-invalid={!!errors[`emails.${i}`]}
                                        onChange={(e) => setList("emails", i, e.target.value)}
                                    />
                                    {values.emails.length > 1 && (
                                        <button
                                            type="button"
                                            className="pk-icon-btn"
                                            aria-label="Remove email"
                                            onClick={() => set("emails", values.emails.filter((_, j) => j !== i))}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {errors[`emails.${i}`] && <span className="pk-error">{errors[`emails.${i}`]}</span>}
                            </div>
                        ))}
                        {values.emails.length < MAX_CONTACTS && (
                            <button type="button" className="pk-link-btn" onClick={() => set("emails", [...values.emails, ""])}>
                                + Add another email
                            </button>
                        )}
                    </div>
                </fieldset>

                {/* Address */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">{labels.address}</legend>
                    <div className="pk-grid-2">
                        {ADDRESS_FIELDS.map((f) => (
                            <Field key={f.key} label={f.label} required={f.required} error={errors[`address.${f.key}`]}>
                                {(id) => (
                                    <TextInput
                                        id={id}
                                        value={values.address[f.key]}
                                        max={f.max}
                                        invalid={!!errors[`address.${f.key}`]}
                                        onChange={(v) => set("address", { ...values.address, [f.key]: v })}
                                    />
                                )}
                            </Field>
                        ))}
                    </div>
                </fieldset>

                {/* Working hours */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">{labels.hours}</legend>
                    {(
                        [
                            ["weekdays", "Monday – Friday"],
                            ["saturday", "Saturday"],
                            ["sunday", "Sunday"],
                        ] as const
                    ).map(([k, title]) => (
                        <DayEditor
                            key={k}
                            title={title}
                            day={values.workingHours[k]}
                            error={errors[`workingHours.${k}`]}
                            onChange={(patch) => setDay(k, patch)}
                        />
                    ))}
                </fieldset>

                {/* Languages */}
                <fieldset className="pk-fieldset">
                    <legend className="pk-legend">
                        Preferred languages for communication <span className="pk-req">*</span>
                    </legend>
                    <div className="pk-chips">
                        {LANGUAGES.map((l) => {
                            const on = values.languages.includes(l);
                            return (
                                <button
                                    key={l}
                                    type="button"
                                    className="pk-chip"
                                    aria-pressed={on}
                                    onClick={() => set("languages", on ? values.languages.filter((x) => x !== l) : [...values.languages, l])}
                                >
                                    {l}
                                </button>
                            );
                        })}
                    </div>
                    {errors.languages && <span className="pk-error">{errors.languages}</span>}
                </fieldset>

                {serverErrors.length > 0 && (
                    <div className="pk-alert" role="alert">
                        {serverErrors.length === 1 ? (
                            serverErrors[0]
                        ) : (
                            <ul>
                                {serverErrors.map((m) => (
                                    <li key={m}>{m}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="pk-actions">
                    {onCancel && (
                        <button type="button" className="pk-btn pk-btn-ghost" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="pk-btn pk-btn-primary" disabled={submitting}>
                        {submitting ? submittingLabel : submitLabel}
                    </button>
                </div>
            </form>

            <aside className="pk-preview" aria-label="Live preview">
                <div className="pk-preview-title">Live preview</div>
                <ProfileCard data={cardData} showDetails placeholders />
            </aside>
        </div>
    );
}

// ─── Small building blocks ──────────────────────────────────────────────────

function Field({
    label,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: (id: string) => ReactNode;
}) {
    const id = useId();
    return (
        <div className="pk-field">
            <label className="pk-label" htmlFor={id}>
                {label}
                {required && <span className="pk-req">*</span>}
            </label>
            {children(id)}
            {error ? <span className="pk-error">{error}</span> : hint ? <span className="pk-hint">{hint}</span> : null}
        </div>
    );
}

function TextInput({
    id,
    value,
    max,
    invalid,
    onChange,
}: {
    id: string;
    value: string;
    max: number;
    invalid?: boolean;
    onChange: (v: string) => void;
}) {
    return (
        <input id={id} className="pk-input" value={value} maxLength={max} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
    );
}

function DayEditor({
    title,
    day,
    error,
    onChange,
}: {
    title: string;
    day: DaySchedule;
    error?: string;
    onChange: (patch: Partial<DaySchedule>) => void;
}) {
    const [showBreak, setShowBreak] = useState(!!day.breakStart || !!day.breakEnd);
    const time = (value: string | null | undefined, key: keyof DaySchedule, label: string) => (
        <input
            type="time"
            className="pk-input"
            aria-label={`${title} ${label}`}
            value={value ?? ""}
            aria-invalid={!!error}
            onChange={(e) => onChange({ [key]: e.target.value })}
        />
    );

    return (
        <div className="pk-day">
            <div className="pk-day-head">
                <span className="pk-day-title">{title}</span>
                <label className="pk-check">
                    <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(e) =>
                            onChange(
                                e.target.checked
                                    ? { closed: true }
                                    : { closed: false, open: day.open || "09:00", close: day.close || "18:00" },
                            )
                        }
                    />
                    Holiday
                </label>
            </div>
            {!day.closed && (
                <>
                    <div className="pk-times">
                        {time(day.open, "open", "opens")}
                        <span>to</span>
                        {time(day.close, "close", "closes")}
                    </div>
                    <label className="pk-check">
                        <input
                            type="checkbox"
                            checked={showBreak}
                            onChange={(e) => {
                                setShowBreak(e.target.checked);
                                onChange(e.target.checked ? { breakStart: "13:00", breakEnd: "14:00" } : { breakStart: "", breakEnd: "" });
                            }}
                        />
                        Lunch Break (check this box to add your lunch break timings)
                    </label>
                    {showBreak && (
                        <div className="pk-times">
                            {time(day.breakStart, "breakStart", "lunch break starts")}
                            <span>to</span>
                            {time(day.breakEnd, "breakEnd", "lunch break ends")}
                        </div>
                    )}
                </>
            )}
            {error && <span className="pk-error">{error}</span>}
        </div>
    );
}
