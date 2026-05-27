"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Download, BarChart3 } from "lucide-react";

import { useGetSubmissionsByFormId } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import logoImg from "~/assets/form-yatra-logo.png";
import { themes, PATTERN_TILE, getFolkPatternSvg } from "~/lib/theme";

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

type Submission = {
    id: string;
    formId?: string | null;
    values?: { fieldId: string; value: string }[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default function FormSubmissions() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id as string | undefined;

    const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");

    const rows = useMemo(() => (submissions ?? []) as Submission[], [submissions]);
    const loading = subsLoading || fieldsLoading;

    const handleExportCSV = () => {
        const sortedFields = (fields ?? []).slice().sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
        const header = ["Submitted At", ...sortedFields.map(f => f.label)].map(h => `"${h}"`).join(",");
        const csvRows = rows.map(r => {
            const date = r.createdAt ? new Date(r.createdAt).toLocaleString() : "";
            const values = sortedFields.map(f => {
                const v = r.values?.find(x => x.fieldId === f.id);
                return `"${(v?.value ?? "").replace(/"/g, '""')}"`;
            });
            return [date, ...values].join(",");
        });
        const csv = [header, ...csvRows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `form-${formId}-responses.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}
        >
            {/* ── Header ── */}
            <header className="w-full shrink-0 flex items-center px-6 py-4 gap-6" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <button
                    onClick={() => router.push("/dashboard/forms")}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: T.cream }}
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-4 border-l pl-6" style={{ borderColor: `${T.border}40` }}>
                    <Image
                        src={logoImg}
                        alt="FormYatra"
                        width={707}
                        height={353}
                        className="h-8 w-auto object-contain brightness-0 invert"
                        style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }}
                    />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: T.border }}>Submissions</span>
                </div>
            </header>

            <FolkPatternStrip />

            <div className="flex-1 flex flex-col px-6 py-12">
                <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
                    
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span style={{ color: T.border }}>✦</span>
                            <h1 className="font-black text-4xl uppercase tracking-tight leading-none" style={{ color: T.cream }}>
                                Data <span style={{ color: T.border }}>Vault</span>
                            </h1>
                        </div>
                        <p className="text-sm font-medium" style={{ color: `${T.cream}70` }}>
                            Review and analyze the responses collected for this form.
                        </p>
                    </div>

                    <div className="flex gap-8 items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-black" style={{ color: T.border }}>{rows.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${T.cream}60` }}>Total Submissions</span>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/forms/${formId}/analytics`}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                                style={{ border: `1.5px solid ${T.border}40`, color: T.border }}
                            >
                                <BarChart3 size={14} /> Analytics
                            </Link>
                            {rows.length > 0 && (
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                                    style={{ background: T.border, color: "#0f1c2e" }}
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm font-bold uppercase tracking-widest" style={{ color: `${T.cream}50` }}>
                            Loading submissions...
                        </div>
                    ) : error ? (
                        <div className="p-6 rounded-lg text-sm font-semibold" style={{ background: "#ef444420", color: "#f87171", border: "1.5px solid #ef444450" }}>
                            Error loading submissions.
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-2xl" style={{ border: `2px dashed ${T.border}40`, background: `${T.panel}50` }}>
                            <span className="text-4xl" style={{ color: T.border }}>❋</span>
                            <div className="text-center">
                                <p className="font-bold text-lg" style={{ color: T.cream }}>No responses yet.</p>
                                <p className="text-sm font-medium" style={{ color: `${T.cream}60` }}>Share your form to start collecting data.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: `1px solid ${T.border}30`, background: T.panel }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest" style={{ background: `${T.bg}`, color: T.border }}>
                                        <tr>
                                            <th className="px-6 py-4 border-b" style={{ borderColor: `${T.border}30` }}>Submitted</th>
                                            {(fields ?? [])
                                                .slice()
                                                .sort((a, b) => parseFloat(a.index) - parseFloat(b.index))
                                                .map((f) => (
                                                    <th key={f.id} className="px-6 py-4 border-b whitespace-nowrap" style={{ borderColor: `${T.border}30` }}>
                                                        {f.label}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody className="font-medium" style={{ color: T.cream }}>
                                        {rows.map((r, i) => (
                                            <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ background: i % 2 === 0 ? "transparent" : `${T.bg}50` }}>
                                                <td className="px-6 py-4 border-b text-xs whitespace-nowrap" style={{ borderColor: `${T.border}15`, color: `${T.cream}70` }}>
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                                                </td>
                                                {(fields ?? [])
                                                    .slice()
                                                    .sort((a, b) => parseFloat(a.index) - parseFloat(b.index))
                                                    .map((f) => {
                                                        const v = r.values?.find((x) => x.fieldId === f.id);
                                                        return (
                                                            <td
                                                                key={f.id}
                                                                className="px-6 py-4 border-b"
                                                                style={{ borderColor: `${T.border}15` }}
                                                            >
                                                                {v && v.value ? v.value : <span style={{ color: `${T.cream}30` }}>-</span>}
                                                            </td>
                                                        );
                                                    })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <FolkPatternStrip />
        </main>
    );
}
