"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft, Plus, Trash2, Globe, Lock,
    ExternalLink, GripVertical, Settings, Eye,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateField, useDeleteField, useGetFields } from "~/hooks/api/form-field";
import { useGetFormWithFields, useUpdateForm } from "~/hooks/api/form";
import logoImg from "~/assets/form-yatra-logo.png";
import { themes, PATTERN_TILE, getFolkPatternSvg, BASE } from "~/lib/theme";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";

const T = themes.mumbai;
const folkPatternSvg = getFolkPatternSvg(T.patternFill, T.patternStroke);
const folkPatternStyle = {
    backgroundImage: folkPatternSvg,
    backgroundSize: `${PATTERN_TILE}px ${PATTERN_TILE}px`,
    backgroundRepeat: "repeat" as const,
    backgroundPosition: "0 0",
};

type FieldType = "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: string; hasOptions: boolean }> = {
    SHORT_TEXT:    { label: "Short Text",     icon: "T",   hasOptions: false },
    LONG_TEXT:     { label: "Long Text",      icon: "¶",   hasOptions: false },
    EMAIL:         { label: "Email Address",  icon: "@",   hasOptions: false },
    NUMBER:        { label: "Number",         icon: "#",   hasOptions: false },
    SINGLE_SELECT: { label: "Single Select",  icon: "◉",   hasOptions: true },
    MULTI_SELECT:  { label: "Multi Select",   icon: "☑",   hasOptions: true },
    CHECKBOX:      { label: "Checkbox",       icon: "✓",   hasOptions: false },
    RATING:        { label: "Rating (1–5)",   icon: "★",   hasOptions: false },
    DATE:          { label: "Date Picker",    icon: "📅",   hasOptions: false },
};

function FolkPatternStrip() {
    return (
        <div
            className="w-full shrink-0 overflow-hidden"
            style={{ ...folkPatternStyle, height: PATTERN_TILE }}
            aria-hidden
        />
    );
}

function FieldPreview({ field }: { field: any }) {
    const inputBase = {
        background: `${T.bg}50`,
        border: `1.5px solid ${T.border}40`,
        color: T.cream,
    };

    switch (field.type) {
        case "SHORT_TEXT":
        case "EMAIL":
        case "NUMBER":
            return <input disabled type={field.type === "EMAIL" ? "email" : field.type === "NUMBER" ? "number" : "text"} placeholder={field.placeholder || "Enter answer..."} className="w-full px-4 py-3 rounded-lg text-sm pointer-events-none" style={inputBase} />;
        case "LONG_TEXT":
            return <textarea disabled placeholder={field.placeholder || "Enter answer..."} className="w-full px-4 py-3 rounded-lg text-sm pointer-events-none min-h-[80px] resize-none" style={inputBase} />;
        case "SINGLE_SELECT":
            return (
                <div className="flex flex-col gap-2">
                    {(field.options?.options ?? ["Option A", "Option B"]).map((opt: string) => (
                        <label key={opt} className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-not-allowed" style={{ background: `${T.bg}50`, border: `1px solid ${T.border}30` }}>
                            <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: T.border }} />
                            <span className="text-sm font-medium" style={{ color: T.cream }}>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        case "MULTI_SELECT":
            return (
                <div className="flex flex-col gap-2">
                    {(field.options?.options ?? ["Option A", "Option B"]).map((opt: string) => (
                        <label key={opt} className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-not-allowed" style={{ background: `${T.bg}50`, border: `1px solid ${T.border}30` }}>
                            <div className="w-4 h-4 rounded" style={{ border: `2px solid ${T.border}` }} />
                            <span className="text-sm font-medium" style={{ color: T.cream }}>{opt}</span>
                        </label>
                    ))}
                </div>
            );
        case "CHECKBOX":
            return (
                <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-not-allowed" style={{ background: `${T.bg}50`, border: `1px solid ${T.border}30` }}>
                    <div className="w-4 h-4 rounded" style={{ border: `2px solid ${T.border}` }} />
                    <span className="text-sm font-medium" style={{ color: T.cream }}>Yes</span>
                </label>
            );
        case "RATING":
            return (
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="w-10 h-10 flex items-center justify-center rounded-lg text-lg font-black border cursor-not-allowed" style={{ borderColor: `${T.border}50`, color: `${T.cream}50` }}>
                            {n}
                        </div>
                    ))}
                </div>
            );
        case "DATE":
            return <input disabled type="date" className="px-4 py-3 rounded-lg text-sm pointer-events-none" style={{ ...inputBase, width: "auto" }} />;
        default:
            return null;
    }
}

export default function FormBuilder() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id as string | undefined;

    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [type, setType] = useState<FieldType>("SHORT_TEXT");
    const [description, setDescription] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [optionInput, setOptionInput] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    const { createFieldAsync, status, error } = useCreateField(formId ?? "");
    const { deleteFieldAsync } = useDeleteField(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
    const { form } = useGetFormWithFields(formId ?? "");
    const { updateFormAsync } = useUpdateForm();

    const hasOptions = FIELD_TYPE_CONFIG[type]?.hasOptions ?? false;

    const handleAddOption = () => {
        if (optionInput.trim() && !options.includes(optionInput.trim())) {
            setOptions((prev) => [...prev, optionInput.trim()]);
            setOptionInput("");
        }
    };

    const handleRemoveOption = (opt: string) => setOptions((prev) => prev.filter((o) => o !== opt));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formId) return;

        await createFieldAsync({
            label: label.trim(),
            type,
            formId,
            description: description.trim() || undefined,
            placeholder: placeholder.trim() || undefined,
            isRequired,
            options: hasOptions && options.length > 0 ? { options } : undefined,
        });

        toast.success("Field added!");
        setOpen(false);
        setLabel(""); setType("SHORT_TEXT"); setDescription(""); setPlaceholder("");
        setIsRequired(false); setOptions([]); setOptionInput("");
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm("Remove this field?")) return;
        await deleteFieldAsync({ id: fieldId });
        toast.success("Field removed.");
    };

    const handleTogglePublish = async () => {
        if (!formId || !form) return;
        const newStatus = form.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
        await updateFormAsync({ id: formId, status: newStatus });
        toast.success(`Form ${newStatus === "PUBLISHED" ? "published! Share the link now." : "unpublished."}`);
    };

    const isPublished = form?.status === "PUBLISHED";

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}
        >
            {/* ── Header ── */}
            <header className="w-full shrink-0 flex items-center justify-between px-6 py-4 gap-6" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard/forms")}
                        className="p-2 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: T.cream }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4 border-l pl-6" style={{ borderColor: `${T.border}40` }}>
                        <Image src={logoImg} alt="FormYatra" width={707} height={353} className="h-8 w-auto object-contain" style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }} />
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: T.border }}>Builder</span>
                    </div>
                </div>

                {/* Form name + publish toggle */}
                <div className="flex items-center gap-4">
                    {form && (
                        <>
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-black" style={{ color: T.cream }}>{form.title}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isPublished ? "#4ade80" : T.border }}>
                                    {isPublished ? "● Published" : "○ Draft"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/form/${formId}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-opacity hover:opacity-90"
                                    style={{ border: `1.5px solid ${T.cream}40`, color: T.cream }}
                                >
                                    <Eye size={13} /> Preview
                                </Link>
                                <button
                                    onClick={handleTogglePublish}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-opacity hover:opacity-90"
                                    style={{
                                        background: isPublished ? "#ef444420" : T.border,
                                        color: isPublished ? "#f87171" : BASE.ink,
                                        border: isPublished ? "1.5px solid #ef444450" : "none",
                                    }}
                                >
                                    {isPublished ? <><Lock size={13} /> Unpublish</> : <><ExternalLink size={13} /> Publish</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* ── Left Sidebar ── */}
                <aside className="w-72 shrink-0 flex flex-col border-r overflow-y-auto" style={{ background: T.panel, borderColor: `${T.border}30` }}>
                    <div className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: `${T.cream}50` }}>Add Field</p>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5"
                                    style={{ background: T.border, color: BASE.ink, boxShadow: `0 4px 14px ${T.border}40` }}
                                >
                                    <Plus size={16} strokeWidth={3} /> Add New Field
                                </button>
                            </DialogTrigger>

                            <DialogContent className="border-0 sm:max-w-lg" style={{ background: T.panel, color: T.cream }}>
                                <DialogHeader>
                                    <DialogTitle className="font-black text-2xl uppercase tracking-tight" style={{ color: T.border }}>Configure Field</DialogTitle>
                                    <DialogDescription className="font-medium" style={{ color: `${T.cream}70` }}>Add a field to your form.</DialogDescription>
                                </DialogHeader>

                                <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit}>
                                    {/* Label */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Field Label</label>
                                        <input
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                            placeholder="e.g. Full Name"
                                            className="px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all w-full"
                                            style={{ background: T.bg, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                            onFocus={e => e.currentTarget.style.borderColor = T.border}
                                            onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                        />
                                    </div>

                                    {/* Type selector */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Field Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.keys(FIELD_TYPE_CONFIG) as FieldType[]).map((ft) => (
                                                <button
                                                    key={ft}
                                                    type="button"
                                                    onClick={() => { setType(ft); setOptions([]); }}
                                                    className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                                    style={{
                                                        background: type === ft ? `${T.border}20` : `${T.bg}80`,
                                                        border: `1.5px solid ${type === ft ? T.border : `${T.border}30`}`,
                                                        color: type === ft ? T.border : `${T.cream}60`,
                                                    }}
                                                >
                                                    <span className="text-base">{FIELD_TYPE_CONFIG[ft].icon}</span>
                                                    {FIELD_TYPE_CONFIG[ft].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Options (if needed) */}
                                    {hasOptions && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Options</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={optionInput}
                                                    onChange={(e) => setOptionInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOption(); } }}
                                                    placeholder="Add option, press Enter"
                                                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium outline-none"
                                                    style={{ background: T.bg, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                                />
                                                <button type="button" onClick={handleAddOption} className="px-3 py-2 rounded-lg text-xs font-black" style={{ background: T.border, color: BASE.ink }}>+ Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {options.map((opt) => (
                                                    <span key={opt} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${T.border}20`, color: T.border }}>
                                                        {opt}
                                                        <button type="button" onClick={() => handleRemoveOption(opt)} className="hover:opacity-70">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Placeholder */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Placeholder <span style={{ color: `${T.cream}40` }}>(Optional)</span></label>
                                        <input
                                            value={placeholder}
                                            onChange={(e) => setPlaceholder(e.target.value)}
                                            placeholder="Hint text..."
                                            className="px-4 py-3 rounded-lg text-sm font-medium outline-none w-full"
                                            style={{ background: T.bg, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                            onFocus={e => e.currentTarget.style.borderColor = T.border}
                                            onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                        />
                                    </div>

                                    {/* Required toggle */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                                        <span className="text-sm font-bold" style={{ color: T.cream }}>Required field</span>
                                    </label>

                                    {error && <p className="text-sm font-semibold text-red-400">{error.message}</p>}

                                    <DialogFooter>
                                        <button
                                            type="submit"
                                            disabled={status === "pending" || !label.trim() || (hasOptions && options.length === 0)}
                                            className="w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-wider disabled:opacity-50"
                                            style={{ background: T.border, color: BASE.ink }}
                                        >
                                            {status === "pending" ? "Saving..." : "Add to Form →"}
                                        </button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Field list */}
                        <div className="mt-6 flex flex-col gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: `${T.cream}50` }}>
                                {fields?.length ?? 0} Fields
                            </p>
                            {fields?.map((f, i) => (
                                <div key={f.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: `${T.bg}80`, border: `1px solid ${T.border}20` }}>
                                    <GripVertical size={14} style={{ color: `${T.cream}30` }} />
                                    <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: T.border, color: BASE.ink }}>{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate" style={{ color: T.cream }}>{f.label}</p>
                                        <p className="text-[9px] font-medium" style={{ color: `${T.cream}50` }}>{FIELD_TYPE_CONFIG[f.type as FieldType]?.label ?? f.type}</p>
                                    </div>
                                    <button onClick={() => handleDeleteField(f.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors" style={{ color: `#f8717180` }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Settings */}
                    {form && (
                        <div className="mt-auto p-5 border-t" style={{ borderColor: `${T.border}20` }}>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: `${T.cream}50` }}>
                                <Settings size={10} className="inline mr-1" />Form Settings
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold" style={{ color: `${T.cream}80` }}>Visibility</span>
                                    <span className="flex items-center gap-1 text-xs font-black" style={{ color: T.border }}>
                                        {form.visibility === "PUBLIC" ? <Globe size={11} /> : <Lock size={11} />}
                                        {form.visibility}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold" style={{ color: `${T.cream}80` }}>Fields</span>
                                    <span className="text-xs font-black" style={{ color: T.border }}>{fields?.length ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── Canvas ── */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="max-w-2xl mx-auto flex flex-col gap-8">
                        <div className="flex flex-col items-center text-center gap-3">
                            <span style={{ color: T.border, fontSize: "2rem" }}>❋</span>
                            <div>
                                <h1 className="font-black text-4xl uppercase tracking-tight" style={{ color: T.cream }}>
                                    {form?.title ?? "Draft"} <span style={{ color: T.border }}>Preview</span>
                                </h1>
                                {form?.description && (
                                    <p className="mt-2 text-sm font-medium max-w-md mx-auto" style={{ color: `${T.cream}60` }}>{form.description}</p>
                                )}
                            </div>
                        </div>

                        {fieldsLoading ? (
                            <div className="text-center py-12 text-sm font-bold uppercase tracking-widest" style={{ color: `${T.cream}50` }}>Loading...</div>
                        ) : fields && fields.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {fields.map((f, i) => (
                                    <div key={f.id} className="flex gap-5 group">
                                        <div className="flex flex-col items-center gap-2 pt-2 opacity-60 shrink-0">
                                            <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black" style={{ borderColor: T.border, color: T.border }}>{i + 1}</div>
                                            {i !== fields.length - 1 && <div className="w-px flex-1 min-h-[20px]" style={{ background: `${T.border}40` }} />}
                                        </div>
                                        <div className="flex-1 p-5 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}30` }}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <label className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: T.cream }}>
                                                        {f.label}
                                                        {f.isRequired && <span className="text-red-400">*</span>}
                                                    </label>
                                                    {f.description && <p className="text-xs mt-0.5 font-medium" style={{ color: `${T.cream}60` }}>{f.description}</p>}
                                                </div>
                                                <span className="text-[10px] font-black px-2 py-1 rounded" style={{ background: `${T.border}20`, color: T.border }}>
                                                    {FIELD_TYPE_CONFIG[f.type as FieldType]?.label ?? f.type}
                                                </span>
                                            </div>
                                            <div className="pointer-events-none opacity-80">
                                                <FieldPreview field={f} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 rounded-2xl border-2 border-dashed" style={{ borderColor: `${T.border}30`, background: `${T.panel}40` }}>
                                <p className="text-lg font-bold" style={{ color: T.cream }}>Canvas is empty</p>
                                <p className="text-sm font-medium mt-1" style={{ color: `${T.cream}50` }}>Add fields from the sidebar to build your form.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
