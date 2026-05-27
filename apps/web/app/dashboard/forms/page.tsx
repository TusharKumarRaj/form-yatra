"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
    Eye, PencilLine, Plus, LogOut, Copy, Check,
    Globe, Lock, Trash2, BarChart3, ExternalLink,
    FileText, Copy as CopyIcon, QrCode,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateForm, useListForms, useUpdateForm, useDeleteForm, useCloneForm } from "~/hooks/api/form";
import logoImg from "~/assets/form-yatra-logo.png";
import mumbaiImg from "~/assets/mumbai.png";
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

function FolkPatternStrip() {
    return (
        <div
            className="w-full shrink-0 overflow-hidden"
            style={{ ...folkPatternStyle, height: PATTERN_TILE }}
            aria-hidden
        />
    );
}

function CopyLinkButton({ formId }: { formId: string }) {
    const [copied, setCopied] = useState(false);
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/form/${formId}`;

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
            style={{ color: T.cream, border: `1.5px solid ${T.cream}30` }}
            title="Copy shareable link"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Link"}
        </button>
    );
}

type InitialField = {
    label: string;
    type: "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";
    placeholder?: string;
    isRequired: boolean;
    tempOptions?: string[];
    options?: { options: string[] };
};

export default function DashboardForms() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"PUBLIC" | "UNLISTED">("PUBLIC");
    const [fields, setFields] = useState<InitialField[]>([]);

    const addField = () => {
        setFields([...fields, { label: "New Question", type: "SHORT_TEXT", isRequired: false }]);
    };

    const updateField = (index: number, updates: Partial<InitialField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates } as InitialField;
        setFields(newFields);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms();
    const { updateFormAsync } = useUpdateForm();
    const { deleteFormAsync } = useDeleteForm();
    const { cloneFormAsync } = useCloneForm();
    const [qrOpen, setQrOpen] = useState<string | null>(null); // formId for QR modal
    const [qrUrl, setQrUrl] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const processedFields = fields.map(f => {
            if ((f.type === "SINGLE_SELECT" || f.type === "MULTI_SELECT") && f.tempOptions) {
                return {
                    ...f,
                    options: { options: f.tempOptions.map(s => s.trim()).filter(Boolean) }
                };
            }
            return f;
        });

        await createFormAsync({
            title: title.trim(),
            description: description.trim() ? description.trim() : undefined,
            visibility,
            status: "UNPUBLISHED",
            fields: processedFields,
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        setVisibility("PUBLIC");
        setFields([]);
    };

    const handleTogglePublish = async (formId: string, currentStatus: string) => {
        const newStatus = currentStatus === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
        await updateFormAsync({ id: formId, status: newStatus });
        toast.success(`Form ${newStatus === "PUBLISHED" ? "published" : "unpublished"}!`);
    };

    const handleDelete = async (formId: string, formTitle: string) => {
        if (!confirm(`Delete "${formTitle}"? This cannot be undone.`)) return;
        await deleteFormAsync({ id: formId });
        toast.success("Form deleted.");
    };

    const handleClone = async (formId: string) => {
        await cloneFormAsync({ id: formId });
        toast.success("Form duplicated!");
    };

    const handleQrCode = (formId: string) => {
        const url = `${window.location.origin}/form/${formId}`;
        setQrUrl(url);
        setQrOpen(formId);
    };

    const publishedCount = forms?.filter((f) => f.status === "PUBLISHED").length ?? 0;
    const totalForms = forms?.length ?? 0;

    return (<>
        <main
            className="min-h-screen flex flex-col"
            style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}
        >
            {/* ── Header ── */}
            <header className="w-full shrink-0" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <nav className="w-full px-10 py-3 flex items-center justify-between max-w-[1400px] mx-auto">
                    <a href="/" className="flex items-center gap-4">
                        <Image
                            src={logoImg}
                            alt="FormYatra"
                            width={707}
                            height={353}
                            className="h-12 w-auto object-contain"
                            style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }}
                        />
                    </a>
                    <div className="flex items-center gap-6">
                        <Link href="/explore" className="text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: `${T.cream}80` }}>
                            Explore
                        </Link>
                        <button
                            onClick={() => router.push("/signin")}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                            style={{ color: T.cream }}
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </nav>
            </header>

            {/* ── Mumbai Hero Banner ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
                <Image
                    src={mumbaiImg}
                    alt="Mumbai skyline"
                    fill
                    className="object-cover object-center"
                    style={{ opacity: 0.5 }}
                    priority
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${T.bg} 0%, transparent 60%)` }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${T.nav}80 0%, transparent 50%)` }} />
                <div className="absolute bottom-6 left-10 flex items-end gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: T.border }}>Creator Dashboard</p>
                        <h1 className="font-black text-5xl uppercase tracking-tight leading-none" style={{ color: T.cream }}>
                            Your <span style={{ color: T.border }}>Forms</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-8 pb-1 ml-6">
                        <div>
                            <span className="text-3xl font-black" style={{ color: T.border }}>{totalForms}</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${T.cream}60` }}>Total</p>
                        </div>
                        <div>
                            <span className="text-3xl font-black" style={{ color: T.border }}>{publishedCount}</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${T.cream}60` }}>Published</p>
                        </div>
                    </div>
                </div>
            </div>

            <FolkPatternStrip />

            {/* ── Body ── */}
            <div className="flex-1 flex flex-col items-center px-6 py-10">
                <div className="w-full max-w-5xl flex flex-col gap-8">

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: `${T.cream}60` }}>
                            Manage and publish your data collection forms.
                        </p>

                        {/* Create Dialog */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-lg font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
                                    style={{ background: T.border, color: BASE.ink }}
                                >
                                    <Plus size={18} strokeWidth={3} /> New Form
                                </button>
                            </DialogTrigger>
                            <DialogContent className="border-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: T.panel, color: T.cream }}>
                                <DialogHeader>
                                    <DialogTitle className="font-black text-2xl uppercase tracking-tight" style={{ color: T.border }}>New Form</DialogTitle>
                                    <DialogDescription className="font-medium" style={{ color: `${T.cream}70` }}>
                                        Name your form to start building.
                                    </DialogDescription>
                                </DialogHeader>

                                <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Form Title</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Customer Feedback"
                                            className="px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all w-full"
                                            style={{ background: T.bg, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                            onFocus={e => e.currentTarget.style.borderColor = T.border}
                                            onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Description <span style={{ color: `${T.cream}40` }}>(Optional)</span></label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is this form for?"
                                            className="px-4 py-3 min-h-[80px] rounded-lg text-sm font-medium outline-none transition-all w-full resize-none"
                                            style={{ background: T.bg, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                            onFocus={e => e.currentTarget.style.borderColor = T.border}
                                            onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Visibility</label>
                                        <div className="flex gap-3">
                                            {(["PUBLIC", "UNLISTED"] as const).map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setVisibility(v)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                                                    style={{
                                                        background: visibility === v ? `${T.border}20` : "transparent",
                                                        border: `1.5px solid ${visibility === v ? T.border : `${T.border}40`}`,
                                                        color: visibility === v ? T.border : `${T.cream}60`,
                                                    }}
                                                >
                                                    {v === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />}
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: `${T.border}20` }}>
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Initial Questions <span style={{ color: `${T.cream}40` }}>(Optional)</span></label>
                                            <button
                                                type="button"
                                                onClick={addField}
                                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                                                style={{ color: T.border }}
                                            >
                                                <Plus size={12} /> Add Question
                                            </button>
                                        </div>

                                        {fields.length === 0 && (
                                            <p className="text-xs font-medium italic" style={{ color: `${T.cream}50` }}>You can add questions now or later in the builder.</p>
                                        )}

                                        {fields.map((field, i) => (
                                            <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border" style={{ borderColor: `${T.border}30`, background: `${T.bg}50` }}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <input
                                                            value={field.label}
                                                            onChange={(e) => updateField(i, { label: e.target.value })}
                                                            placeholder="Question text"
                                                            className="w-full px-3 py-2 rounded text-sm font-medium outline-none"
                                                            style={{ background: T.bg, border: `1px solid ${T.border}30`, color: T.cream }}
                                                        />
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={field.type}
                                                                onChange={(e) => {
                                                                    const newType = e.target.value as any;
                                                                    if ((newType === "SINGLE_SELECT" || newType === "MULTI_SELECT") && !field.tempOptions) {
                                                                        updateField(i, { type: newType, tempOptions: ["Option 1", "Option 2"] });
                                                                    } else {
                                                                        updateField(i, { type: newType });
                                                                    }
                                                                }}
                                                                className="px-3 py-2 rounded text-sm font-medium outline-none"
                                                                style={{ background: T.bg, border: `1px solid ${T.border}30`, color: T.cream }}
                                                            >
                                                                <option value="SHORT_TEXT">Short Text</option>
                                                                <option value="LONG_TEXT">Long Text</option>
                                                                <option value="EMAIL">Email</option>
                                                                <option value="NUMBER">Number</option>
                                                                <option value="SINGLE_SELECT">Single Select</option>
                                                                <option value="MULTI_SELECT">Multi Select</option>
                                                                <option value="CHECKBOX">Checkbox</option>
                                                                <option value="RATING">Rating</option>
                                                                <option value="DATE">Date</option>
                                                            </select>
                                                            
                                                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer ml-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.isRequired}
                                                                    onChange={(e) => updateField(i, { isRequired: e.target.checked })}
                                                                    className="w-3.5 h-3.5"
                                                                    style={{ accentColor: T.border }}
                                                                />
                                                                <span style={{ color: `${T.cream}80` }}>Required</span>
                                                            </label>
                                                        </div>

                                                        {(field.type === "SINGLE_SELECT" || field.type === "MULTI_SELECT") && field.tempOptions && (
                                                            <div className="mt-2 pl-4 border-l-2 flex flex-col gap-2" style={{ borderColor: `${T.border}40` }}>
                                                                <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: T.border }}>Options</label>
                                                                {field.tempOptions.map((opt, optIndex) => (
                                                                    <div key={optIndex} className="flex gap-2">
                                                                        <input
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...field.tempOptions!];
                                                                                newOpts[optIndex] = e.target.value;
                                                                                updateField(i, { tempOptions: newOpts });
                                                                            }}
                                                                            placeholder={`Option ${optIndex + 1}`}
                                                                            className="w-full px-3 py-1.5 rounded text-sm font-medium outline-none"
                                                                            style={{ background: T.bg, border: `1px solid ${T.border}30`, color: T.cream }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newOpts = field.tempOptions!.filter((_, idx) => idx !== optIndex);
                                                                                updateField(i, { tempOptions: newOpts });
                                                                            }}
                                                                            className="p-1.5 rounded transition-colors hover:bg-white/10"
                                                                            style={{ color: `${T.cream}50` }}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newOpts = [...field.tempOptions!, `Option ${field.tempOptions!.length + 1}`];
                                                                        updateField(i, { tempOptions: newOpts });
                                                                    }}
                                                                    className="self-start text-[10px] font-bold uppercase tracking-widest mt-1 transition-opacity hover:opacity-80 flex items-center gap-1"
                                                                    style={{ color: T.border }}
                                                                >
                                                                    <Plus size={12} /> Add Option
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button type="button" onClick={() => removeField(i)} className="p-1.5 rounded transition-colors hover:bg-white/10 mt-1" style={{ color: "#ef4444" }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {error && <p className="text-sm font-semibold text-red-400">{error.message}</p>}

                                    <DialogFooter>
                                        <button
                                            type="submit"
                                            disabled={status === "pending" || !title.trim()}
                                            className="w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                                            style={{ background: T.border, color: BASE.ink }}
                                        >
                                            {status === "pending" ? "Creating..." : "Create & Build →"}
                                        </button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Forms Grid */}
                    <section>
                        {isLoading ? (
                            <div className="p-12 text-center text-sm font-bold uppercase tracking-widest" style={{ color: `${T.cream}50` }}>
                                Loading forms...
                            </div>
                        ) : forms && forms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {forms.map((form) => (
                                    <article
                                        key={form.id}
                                        className="relative p-6 rounded-xl flex flex-col gap-4 overflow-hidden group"
                                        style={{ background: T.panel, border: `1px solid ${T.border}30` }}
                                    >
                                        {/* Deco circle */}
                                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ background: T.border }} />

                                        {/* Status + Visibility row */}
                                        <div className="relative z-10 flex items-center gap-2">
                                            <span
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest"
                                                style={{
                                                    background: form.status === "PUBLISHED" ? "#22c55e20" : `${T.border}15`,
                                                    color: form.status === "PUBLISHED" ? "#22c55e" : T.border,
                                                }}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${form.status === "PUBLISHED" ? "bg-green-400" : "bg-amber-400"}`} />
                                                {form.status}
                                            </span>
                                            <span
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest"
                                                style={{ background: `${T.cream}10`, color: `${T.cream}70` }}
                                            >
                                                {form.visibility === "PUBLIC" ? <Globe size={10} /> : <Lock size={10} />}
                                                {form.visibility}
                                            </span>
                                        </div>

                                        {/* Title & description */}
                                        <div className="relative z-10 flex flex-col gap-1 flex-1">
                                            <h2 className="text-xl font-black uppercase tracking-tight line-clamp-1" style={{ color: T.cream }}>
                                                {form.title}
                                            </h2>
                                            <p className="text-sm font-medium line-clamp-2 min-h-[40px]" style={{ color: `${T.cream}70` }}>
                                                {form.description || "No description."}
                                            </p>
                                            <span className="text-[10px] font-bold mt-2" style={{ color: `${T.cream}40` }}>
                                                {form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                                            </span>
                                        </div>

                                        {/* Action Row */}
                                        <div className="relative z-10 flex flex-col gap-2 pt-4" style={{ borderTop: `1px solid ${T.border}20` }}>
                                            {/* Primary Actions */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <Link
                                                    href={`/dashboard/forms/${form.id}`}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{ color: T.border, border: `1.5px solid ${T.border}50` }}
                                                >
                                                    <PencilLine size={13} /> Builder
                                                </Link>
                                                <Link
                                                    href={`/dashboard/forms/${form.id}/analytics`}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{ color: T.cream, border: `1.5px solid ${T.cream}30` }}
                                                >
                                                    <BarChart3 size={13} /> Analytics
                                                </Link>
                                                <Link
                                                    href={`/form/${form.id}/submissions`}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{ color: T.cream, border: `1.5px solid ${T.cream}30` }}
                                                >
                                                    <Eye size={13} /> Responses
                                                </Link>
                                            </div>
                                            {/* Secondary Actions */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <CopyLinkButton formId={form.id} />
                                                <button
                                                    onClick={() => handleQrCode(form.id)}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{ color: T.cream, border: `1.5px solid ${T.cream}20` }}
                                                    title="QR Code"
                                                >
                                                    <QrCode size={13} /> QR
                                                </button>
                                                <button
                                                    onClick={() => handleClone(form.id)}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{ color: T.cream, border: `1.5px solid ${T.cream}20` }}
                                                    title="Duplicate form"
                                                >
                                                    <CopyIcon size={13} /> Clone
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePublish(form.id, form.status)}
                                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-white/5"
                                                    style={{
                                                        color: form.status === "PUBLISHED" ? "#f87171" : "#4ade80",
                                                        border: `1.5px solid ${form.status === "PUBLISHED" ? "#f8717140" : "#4ade8040"}`,
                                                    }}
                                                    title={form.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                                                >
                                                    {form.status === "PUBLISHED" ? <Lock size={13} /> : <ExternalLink size={13} />}
                                                    {form.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(form.id, form.title)}
                                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors hover:bg-red-500/10"
                                                style={{ color: "#f87171", border: `1.5px solid #f8717120` }}
                                            >
                                                <Trash2 size={13} /> Delete Form
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-5 py-28 rounded-2xl" style={{ border: `2px dashed ${T.border}40`, background: `${T.panel}50` }}>
                                <FileText size={40} style={{ color: `${T.border}50` }} />
                                <div className="text-center">
                                    <p className="font-bold text-lg" style={{ color: T.cream }}>No forms yet</p>
                                    <p className="text-sm font-medium" style={{ color: `${T.cream}60` }}>Create your first form to start collecting data.</p>
                                </div>
                                <button
                                    onClick={() => setOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm uppercase tracking-wider"
                                    style={{ background: T.border, color: BASE.ink }}
                                >
                                    <Plus size={16} /> Create Form
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <FolkPatternStrip />
        </main>

        {/* QR Code Modal */}
        {qrOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.75)" }}
                onClick={() => setQrOpen(null)}
            >
                <div
                    className="flex flex-col items-center gap-6 p-8 rounded-2xl max-w-sm w-full"
                    style={{ background: T.panel, border: `2px solid ${T.border}` }}
                    onClick={e => e.stopPropagation()}
                >
                    <p className="font-black text-sm uppercase tracking-widest" style={{ color: T.border }}>QR Code</p>
                    {/* SVG QR placeholder — using a free API */}
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&bgcolor=1d5c3a&color=e8a020&format=png`}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="rounded-xl"
                    />
                    <p className="text-xs font-medium text-center break-all" style={{ color: `${T.cream}60` }}>{qrUrl}</p>
                    <div className="flex gap-3 w-full">
                        <a
                            href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&bgcolor=1d5c3a&color=e8a020&format=png`}
                            download="formyatra-qr.png"
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest text-center transition-opacity hover:opacity-80"
                            style={{ background: T.border, color: BASE.ink }}
                        >
                            Download
                        </a>
                        <button
                            onClick={() => setQrOpen(null)}
                            className="flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                            style={{ border: `1.5px solid ${T.border}40`, color: T.cream }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>);
}
