"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { ChevronLeft, BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import Image from "next/image";

import { useGetFormAnalytics, useGetFormWithFields } from "~/hooks/api/form";
import { themes, PATTERN_TILE, getFolkPatternSvg, BASE } from "~/lib/theme";
import logoImg from "~/assets/form-yatra-logo.png";

const T = themes.mumbai;
const folkPatternSvg = getFolkPatternSvg(T.patternFill, T.patternStroke);
const folkPatternStyle = {
    backgroundImage: folkPatternSvg,
    backgroundSize: `${PATTERN_TILE}px ${PATTERN_TILE}px`,
    backgroundRepeat: "repeat" as const,
    backgroundPosition: "0 0",
};

const COLORS = ["#e8a020", "#f0a030", "#4e9af1", "#a78bfa", "#34d399", "#f87171", "#fb923c"];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="flex flex-col gap-2 p-6 rounded-xl" style={{ background: T.panel, border: `1.5px solid ${T.border}20` }}>
            <div className="flex items-center gap-2" style={{ color: T.border }}>{icon}</div>
            <p className="text-3xl font-black" style={{ color: T.cream }}>{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${T.cream}50` }}>{label}</p>
        </div>
    );
}

export default function AnalyticsPage() {
    const params = useParams();
    const formId = params?.id as string;
    const { analytics, isLoading } = useGetFormAnalytics(formId);
    const { form } = useGetFormWithFields(formId);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-black text-sm uppercase tracking-widest"
                style={{ background: T.bg, color: T.border }}>
                Loading analytics...
            </div>
        );
    }

    const choiceFields = analytics?.fieldBreakdown.filter(f =>
        f.valueCounts.length > 0
    ) ?? [];

    const avgPerDay = analytics && analytics.submissionsPerDay.length > 0
        ? (analytics.totalSubmissions / analytics.submissionsPerDay.length).toFixed(1)
        : "0";

    return (
        <main className="min-h-screen flex flex-col" style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
            {/* Header */}
            <header className="w-full shrink-0" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <nav className="w-full px-10 py-3 flex items-center justify-between max-w-[1400px] mx-auto">
                    <a href="/" className="flex items-center gap-4">
                        <Image src={logoImg} alt="FormYatra" width={707} height={353}
                            className="h-10 w-auto object-contain"
                            style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }}
                        />
                    </a>
                    <Link href={`/dashboard/forms/${formId}`}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                        style={{ color: `${T.cream}80` }}>
                        <ChevronLeft size={14} /> Back to Builder
                    </Link>
                </nav>
            </header>

            <div className="w-full shrink-0 overflow-hidden" style={{ ...folkPatternStyle, height: PATTERN_TILE }} aria-hidden />

            {/* Body */}
            <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full flex flex-col gap-8">
                {/* Title */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: T.border }}>
                        <BarChart3 size={12} className="inline mr-1" />Analytics
                    </p>
                    <h1 className="font-black text-4xl uppercase tracking-tight" style={{ color: T.cream }}>
                        {form?.title ?? "Form Analytics"}
                    </h1>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Users size={18} />} label="Total Responses" value={analytics?.totalSubmissions ?? 0} />
                    <StatCard icon={<TrendingUp size={18} />} label="Avg Per Day" value={avgPerDay} />
                    <StatCard icon={<Calendar size={18} />} label="Days Active" value={analytics?.submissionsPerDay.length ?? 0} />
                    <StatCard icon={<BarChart3 size={18} />} label="Questions" value={analytics?.fieldBreakdown.length ?? 0} />
                </div>

                {/* Trend Line Chart */}
                {analytics && analytics.submissionsPerDay.length > 0 && (
                    <div className="p-6 rounded-xl" style={{ background: T.panel, border: `1.5px solid ${T.border}20` }}>
                        <h2 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: T.border }}>
                            Submission Trend
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={analytics.submissionsPerDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${T.cream}10`} />
                                <XAxis dataKey="date" tick={{ fill: `${T.cream}60`, fontSize: 10 }} />
                                <YAxis tick={{ fill: `${T.cream}60`, fontSize: 10 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}
                                    labelStyle={{ color: T.cream }}
                                    itemStyle={{ color: T.border }}
                                />
                                <Line type="monotone" dataKey="count" stroke={T.border} strokeWidth={2.5}
                                    dot={{ fill: T.border, r: 4 }} name="Responses" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Field Breakdown */}
                {choiceFields.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: T.border }}>
                            Question Breakdown
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {choiceFields.map((field, idx) => (
                                <div key={field.fieldId} className="p-6 rounded-xl flex flex-col gap-4"
                                    style={{ background: T.panel, border: `1.5px solid ${T.border}20` }}>
                                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: T.border }}>
                                        {field.fieldLabel}
                                        <span className="ml-2 font-normal normal-case tracking-normal" style={{ color: `${T.cream}40` }}>
                                            ({field.fieldType.replace(/_/g, " ")})
                                        </span>
                                    </p>

                                    {field.valueCounts.length === 0 ? (
                                        <p className="text-xs" style={{ color: `${T.cream}40` }}>No data yet</p>
                                    ) : field.fieldType === "RATING" ? (
                                        <ResponsiveContainer width="100%" height={150}>
                                            <BarChart data={field.valueCounts.sort((a, b) => Number(a.value) - Number(b.value))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={`${T.cream}10`} />
                                                <XAxis dataKey="value" tick={{ fill: `${T.cream}60`, fontSize: 10 }} />
                                                <YAxis tick={{ fill: `${T.cream}60`, fontSize: 10 }} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}
                                                    labelStyle={{ color: T.cream }}
                                                    itemStyle={{ color: T.border }}
                                                />
                                                <Bar dataKey="count" fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} name="Responses" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <ResponsiveContainer width="50%" height={150}>
                                                <PieChart>
                                                    <Pie data={field.valueCounts} dataKey="count" nameKey="value"
                                                        cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                                                        {field.valueCounts.map((_, i) => (
                                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8 }}
                                                        labelStyle={{ color: T.cream }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                {field.valueCounts.map((vc, i) => (
                                                    <div key={vc.value} className="flex items-center justify-between text-xs">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                                            <span style={{ color: T.cream }}>{vc.value}</span>
                                                        </span>
                                                        <span className="font-black" style={{ color: T.border }}>{vc.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analytics?.totalSubmissions === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center gap-4">
                        <BarChart3 size={48} style={{ color: `${T.border}40` }} />
                        <p className="font-black text-xl uppercase tracking-widest" style={{ color: `${T.cream}40` }}>
                            No responses yet
                        </p>
                        <p className="text-sm" style={{ color: `${T.cream}30` }}>
                            Share your form to start collecting responses and see analytics here.
                        </p>
                        <Link
                            href={`/form/${formId}`}
                            target="_blank"
                            className="mt-2 px-6 py-3 rounded-lg font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-80"
                            style={{ background: T.border, color: BASE.ink }}
                        >
                            Open Form →
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
