// profile-kit — shared by PROchure-sales and PROchure.app-admin. Keep both copies identical.
import type { ReactNode } from "react";
import "./profile-kit.css";
import { variantLabels } from "./constants";
import { addressLines, formatPhone, workingHoursLines } from "./format";
import type { ProfileCardData } from "./types";

interface ProfileCardProps {
    data: ProfileCardData;
    /** Also render the white details section (contacts, address, hours, languages). */
    showDetails?: boolean;
    /** Show field names in empty slots (form preview / stencil mode). */
    placeholders?: boolean;
    /** Renders the X close button in the top-left corner. */
    onClose?: () => void;
    /** "light" = white card with theme-colour text (used for listing grids). */
    tone?: "dark" | "light";
    className?: string;
}

/** The PROchure visiting card. The dark top part is always 1.75 : 1. */
export default function ProfileCard({
    data,
    showDetails = false,
    placeholders = false,
    onClose,
    tone = "dark",
    className,
}: ProfileCardProps) {
    const isBrand = data.profileType === "SERVICE_AND_RETAIL_BRANDS";
    const kind = isBrand ? null : (data.consultantKind ?? "INDEPENDENT");
    const labels = variantLabels(data.profileType, kind);

    const slot = (value: string | null | undefined, label: string, required = true): ReactNode =>
        value?.trim() ? value : placeholders ? <span className="pk-placeholder">{label}{required ? " *" : ""}</span> : null;

    const since = data.sinceYear?.trim()
        ? `${labels.sinceShort} ${data.sinceYear}`
        : placeholders ? <span className="pk-placeholder">{labels.since} *</span> : null;

    const name = slot(data.name, labels.name);
    const services = slot(data.servicesOffered, labels.services);
    const degrees = slot(data.degrees, "Degrees");
    const consultantName = slot(data.consultantName, "Name of consultant", false);
    const regNo = slot(
        data.registrationNumber?.trim() ? `Reg. No. ${data.registrationNumber.trim()}` : null,
        "Statutory body registration number",
        false,
    );

    return (
        <div className={`pk-root pk-card${tone === "light" ? " pk-card-light" : ""} ${className ?? ""}`}>
            <div className="pk-card-top">
                <div className="pk-card-top-inner">
                    <div className="pk-card-head">
                        {onClose && (
                            <button type="button" className="pk-x" onClick={onClose} aria-label="Close">
                                X
                            </button>
                        )}
                        {data.isWomenEntrepreneur ? (
                            <span className="pk-badge">She-Pro</span>
                        ) : placeholders ? (
                            <span></span>
                        ) : null}
                    </div>

                    <div className="pk-card-main">
                        {kind === "INDEPENDENT" && (
                            <>
                                <div className="pk-left">
                                    <div className="pk-name">{name}</div>
                                    {degrees && <div className="pk-line">{degrees}</div>}
                                    {regNo && <div className="pk-line pk-line-sm">{regNo}</div>}
                                </div>
                                <div className="pk-center pk-services">{services}</div>
                            </>
                        )}

                        {kind === "CONSULTANCY" && (
                            <>
                                <div className="pk-center pk-name">{name}</div>
                                {consultantName && <div className="pk-left pk-line">{consultantName}</div>}
                                <div className="pk-center pk-services">{services}</div>
                            </>
                        )}

                        {isBrand && (
                            <>
                                <div className="pk-center pk-name">{name}</div>
                                <div className="pk-center pk-services">{services}</div>
                            </>
                        )}
                    </div>

                    {since && <div className="pk-since">{since}</div>}
                </div>
            </div>

            {showDetails && <CardDetails data={data} labels={labels} placeholders={placeholders} />}
        </div>
    );
}

function CardDetails({
    data,
    labels,
    placeholders,
}: {
    data: ProfileCardData;
    labels: ReturnType<typeof variantLabels>;
    placeholders: boolean;
}) {
    const phones = (data.contactNumbers ?? []).filter(Boolean);
    const emails = (data.emails ?? []).filter(Boolean);
    const address = addressLines(data.address);
    const hours = workingHoursLines(data.workingHours);
    const languages = (data.languages ?? []).filter(Boolean);
    const empty = placeholders ? <span className="pk-empty">—</span> : null;
    const servicesDetail = data.servicesDetail?.trim();

    return (
        <div className="pk-card-body">
            <Section label={labels.servicesDetail}>
                {servicesDetail ? <div style={{ whiteSpace: "pre-line" }}>{servicesDetail}</div> : empty}
            </Section>
            <Section label="Contact number (s)">
                {phones.length
                    ? phones.map((p) => (
                          <div key={p} className="pk-sec-label pk-blue">
                              <a href={`tel:${p}`}>{formatPhone(p)}</a>
                          </div>
                      ))
                    : empty}
            </Section>
            <Section label="Email ID (s)">
                {emails.length
                    ? emails.map((m) => (
                          <div key={m} className="pk-sec-label-lower pk-blue">
                              <a href={`mailto:${m}`}>{m}</a>
                          </div>
                      ))
                    : empty}
            </Section>
            <Section label={labels.address}>
                {address.length ? address.map((l, i) => <div key={i}>{l}</div>) : empty}
            </Section>
            <Section label={labels.hours}>
                {hours.length ? (
                    <dl className="pk-hours" style={{ margin: 0 }}>
                        {hours.map((h) => (
                            <div key={h.label} style={{ display: "contents" }}>
                                <dt>{h.label}</dt>
                                <dd>{h.text}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    empty
                )}
            </Section>
            <Section label="Preferred languages for communication">
                {languages.length ? languages.join(", ") : empty}
            </Section>
        </div>
    );
}

function Section({ label, blue, children }: { label: string; blue?: boolean; children: ReactNode }) {
    if (children === null || children === undefined) return null;
    return (
        <div>
            <div className={`pk-sec-label${blue ? " pk-blue" : ""}`}>{label}</div>
            <div className="pk-sec-value">{children}</div>
        </div>
    );
}
