"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";
import logoImg from "~/assets/form-yatra-logo.png";
import { themes, PATTERN_TILE, getFolkPatternSvg, BASE } from "~/lib/theme";

const T = themes.jaipur;
const folkPatternSvg = getFolkPatternSvg(T.patternFill, T.patternStroke);
const folkPatternStyle = {
    backgroundImage: folkPatternSvg,
    backgroundSize: `${PATTERN_TILE}px ${PATTERN_TILE}px`,
    backgroundRepeat: "repeat" as const,
    backgroundPosition: "0 0",
};

function FolkPatternStrip() {
    return <div className="w-full shrink-0 overflow-hidden" style={{ ...folkPatternStyle, height: PATTERN_TILE }} aria-hidden />;
}

// Multi-value state for multi-select
function MultiSelectField({ field, value, onChange }: { field: any; value: string; onChange: (v: string) => void }) {
    const selected: string[] = value ? value.split("|||") : [];
    const toggle = (opt: string) => {
        const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
        onChange(next.join("|||"));
    };

    return (
        <div className="flex flex-col gap-2">
            {(field.options?.options ?? []).map((opt: string) => {
                const checked = selected.includes(opt);
                return (
                    <label
                        key={opt}
                        onClick={() => toggle(opt)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all"
                        style={{
                            background: checked ? `${T.border}20` : `${T.bg}80`,
                            border: `1.5px solid ${checked ? T.border : `${T.border}40`}`,
                        }}
                    >
                        <div
                            className="w-4 h-4 rounded flex items-center justify-center text-xs font-black"
                            style={{ border: `2px solid ${checked ? T.border : `${T.border}60`}`, background: checked ? T.border : "transparent", color: BASE.ink }}
                        >
                            {checked ? "✓" : ""}
                        </div>
                        <span className="text-sm font-medium" style={{ color: T.cream }}>{opt}</span>
                    </label>
                );
            })}
        </div>
    );
}

function RatingField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const selected = Number(value) || 0;
    return (
        <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(String(n))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-lg font-black transition-all"
                    style={{
                        background: selected >= n ? T.border : `${T.bg}80`,
                        border: `2px solid ${selected >= n ? T.border : `${T.border}40`}`,
                        color: selected >= n ? BASE.ink : `${T.cream}60`,
                        transform: selected >= n ? "scale(1.1)" : "scale(1)",
                    }}
                >
                    {n}
                </button>
            ))}
        </div>
    );
}

export default function PublicFormPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status, error } = useCreateSubmission();

    const [values, setValues] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!form?.fields) return;
        const initial: Record<string, string> = {};
        for (const f of form.fields) initial[f.id] = "";
        setValues(initial);
    }, [form?.fields]);

    const handleChange = (fieldId: string, v: string) => {
        setValues((s) => ({ ...s, [fieldId]: v }));
        setValidationErrors((e) => { const { [fieldId]: _, ...rest } = e; return rest; });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formId || !form) return;

        // Validate required fields
        const errors: Record<string, string> = {};
        for (const f of form.fields) {
            if (f.isRequired && (!values[f.id] || values[f.id].trim() === "")) {
                errors[f.id] = "This field is required.";
            }
        }
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        await createSubmissionAsync({
            formId,
            values: Object.entries(values).map(([fieldId, value]) => ({ fieldId, value })),
        });

        setSubmitted(true);
    };

    const inputStyle = {
        background: `${T.bg}80`,
        border: `1.5px solid ${T.border}40`,
        color: T.cream,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-sm" style={{ background: T.bg, color: T.border }}>
                Loading Form...
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
                <div className="text-center">
                    <p className="font-black text-2xl uppercase tracking-widest" style={{ color: T.border }}>Form Not Found</p>
                    <p className="mt-2 text-sm font-medium" style={{ color: `${T.cream}60` }}>This form may be unpublished or the link is invalid.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center" style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
            <div className="w-full max-w-2xl flex flex-col min-h-screen shadow-2xl" style={{ background: T.panel, borderLeft: `2px solid ${T.border}`, borderRight: `2px solid ${T.border}` }}>

                {/* Header */}
                <header className="w-full shrink-0 flex items-center justify-center py-6" style={{ background: T.nav }}>
                    <Image src={logoImg} alt="FormYatra" width={707} height={353} className="h-10 w-auto object-contain" style={{ filter: "brightness(0) saturate(100%) invert(56%) sepia(87%) saturate(2250%) hue-rotate(345deg) brightness(101%) contrast(92%)" }} />
                </header>

                <FolkPatternStrip />

                <div className="flex-1 px-8 py-12 flex flex-col">
                    {submitted ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                            <span className="text-6xl" style={{ color: T.border }}>❋</span>
                            <div>
                                <h1 className="font-black text-4xl uppercase tracking-tight" style={{ color: T.cream }}>
                                    Thank <span style={{ color: T.border }}>You!</span>
                                </h1>
                                <p className="mt-2 text-sm font-medium" style={{ color: `${T.cream}80` }}>
                                    Your response has been securely recorded.
                                </p>
                            </div>
                            <button
                                onClick={() => { setSubmitted(false); setValues(Object.fromEntries(Object.keys(values).map((k) => [k, ""]))); }}
                                className="mt-4 px-6 py-3 rounded-lg font-black text-sm uppercase tracking-wider"
                                style={{ border: `1.5px solid ${T.border}50`, color: T.border }}
                            >
                                Submit another response
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10">
                            {/* Form heading */}
                            <div className="text-center flex flex-col items-center">
                                <span className="mb-4 text-2xl" style={{ color: T.border }}>✦</span>
                                <h1 className="font-black text-4xl uppercase tracking-tight" style={{ color: T.cream }}>{form.title}</h1>
                                {form.description && (
                                    <p className="mt-3 text-sm font-medium leading-relaxed max-w-md" style={{ color: `${T.cream}70` }}>{form.description}</p>
                                )}
                            </div>

                            {/* Fields */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
                                {form.fields.map((f, index) => (
                                    <div key={f.id} className="flex flex-col gap-2 relative">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-sm shrink-0" style={{ background: T.border, color: BASE.ink }}>
                                                {index + 1}
                                            </span>
                                            <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: T.cream }}>
                                                {f.label}
                                                {f.isRequired && <span className="ml-1" style={{ color: "#ef4444" }}>*</span>}
                                            </label>
                                        </div>

                                        {f.description && (
                                            <p className="text-[11px] font-medium mb-1 pl-7" style={{ color: `${T.cream}50` }}>{f.description}</p>
                                        )}

                                        <div className="pl-7">
                                            {/* SHORT_TEXT / EMAIL / NUMBER */}
                                            {(f.type === "SHORT_TEXT" || f.type === "EMAIL" || f.type === "NUMBER") && (
                                                <input
                                                    type={f.type === "EMAIL" ? "email" : f.type === "NUMBER" ? "number" : "text"}
                                                    value={values[f.id] ?? ""}
                                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                                    placeholder={f.placeholder ?? ""}
                                                    className="w-full px-4 py-3.5 rounded-lg text-sm font-medium outline-none transition-all"
                                                    style={inputStyle}
                                                    onFocus={e => e.currentTarget.style.borderColor = T.border}
                                                    onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                                />
                                            )}

                                            {/* LONG_TEXT */}
                                            {f.type === "LONG_TEXT" && (
                                                <textarea
                                                    value={values[f.id] ?? ""}
                                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                                    placeholder={f.placeholder ?? "Share your thoughts..."}
                                                    className="w-full px-4 py-3.5 rounded-lg text-sm font-medium outline-none transition-all resize-none min-h-[120px]"
                                                    style={inputStyle}
                                                    onFocus={e => e.currentTarget.style.borderColor = T.border}
                                                    onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                                />
                                            )}

                                            {/* SINGLE_SELECT */}
                                            {f.type === "SINGLE_SELECT" && (
                                                <div className="flex flex-col gap-2">
                                                    {(f.options?.options ?? []).map((opt: string) => (
                                                        <label
                                                            key={opt}
                                                            onClick={() => handleChange(f.id, opt)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all"
                                                            style={{
                                                                background: values[f.id] === opt ? `${T.border}20` : `${T.bg}80`,
                                                                border: `1.5px solid ${values[f.id] === opt ? T.border : `${T.border}40`}`,
                                                            }}
                                                        >
                                                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: values[f.id] === opt ? T.border : `${T.border}60` }}>
                                                                {values[f.id] === opt && <div className="w-2 h-2 rounded-full" style={{ background: T.border }} />}
                                                            </div>
                                                            <span className="text-sm font-medium" style={{ color: T.cream }}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {/* MULTI_SELECT */}
                                            {f.type === "MULTI_SELECT" && (
                                                <MultiSelectField field={f} value={values[f.id] ?? ""} onChange={(v) => handleChange(f.id, v)} />
                                            )}

                                            {/* CHECKBOX */}
                                            {f.type === "CHECKBOX" && (
                                                <label
                                                    onClick={() => handleChange(f.id, values[f.id] === "true" ? "false" : "true")}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all w-fit"
                                                    style={{
                                                        background: values[f.id] === "true" ? `${T.border}20` : `${T.bg}80`,
                                                        border: `1.5px solid ${values[f.id] === "true" ? T.border : `${T.border}40`}`,
                                                    }}
                                                >
                                                    <div className="w-5 h-5 rounded flex items-center justify-center font-black text-xs shrink-0" style={{ background: values[f.id] === "true" ? T.border : "transparent", border: `2px solid ${T.border}`, color: BASE.ink }}>
                                                        {values[f.id] === "true" ? "✓" : ""}
                                                    </div>
                                                    <span className="text-sm font-medium" style={{ color: T.cream }}>Yes</span>
                                                </label>
                                            )}

                                            {/* RATING */}
                                            {f.type === "RATING" && (
                                                <RatingField value={values[f.id] ?? ""} onChange={(v) => handleChange(f.id, v)} />
                                            )}

                                            {/* DATE */}
                                            {f.type === "DATE" && (
                                                <input
                                                    type="date"
                                                    value={values[f.id] ?? ""}
                                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                                    className="px-4 py-3.5 rounded-lg text-sm font-medium outline-none transition-all"
                                                    style={{ ...inputStyle, colorScheme: "dark" }}
                                                    onFocus={e => e.currentTarget.style.borderColor = T.border}
                                                    onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                                />
                                            )}
                                        </div>

                                        {/* Validation error */}
                                        {validationErrors[f.id] && (
                                            <p className="pl-7 text-xs font-bold" style={{ color: "#f87171" }}>{validationErrors[f.id]}</p>
                                        )}
                                    </div>
                                ))}

                                {error && <div className="text-sm font-bold text-center" style={{ color: "#ef4444" }}>{error.message}</div>}

                                <div className="mt-8 pt-8 pl-7" style={{ borderTop: `1px solid ${T.border}20` }}>
                                    <button
                                        type="submit"
                                        disabled={status === "pending"}
                                        className="w-full py-4 rounded-lg font-black text-sm uppercase tracking-widest transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                        style={{ background: T.border, color: BASE.ink, boxShadow: `0 4px 14px ${T.border}40` }}
                                    >
                                        {status === "pending" ? "Submitting..." : "Submit Response →"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <FolkPatternStrip />
            </div>
        </main>
    );
}
