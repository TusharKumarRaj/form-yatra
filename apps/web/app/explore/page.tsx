"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Globe, ArrowRight, FileText } from "lucide-react";

import { trpc } from "~/trpc/client";
import logoImg from "~/assets/form-yatra-logo.png";
import jaipurImg from "~/assets/jaipur.png";
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

export default function ExplorePage() {
    const [search, setSearch] = useState("");

    const { data: forms, isLoading } = trpc.form.listPublicForms.useQuery();

    const filtered = (forms ?? []).filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        (f.description ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen flex flex-col" style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
            {/* ── Header ── */}
            <header className="w-full shrink-0" style={{ background: T.nav }}>
                <nav className="w-full px-10 py-3 flex items-center justify-between max-w-[1400px] mx-auto">
                    <a href="/" className="flex items-center gap-4">
                        <Image src={logoImg} alt="FormYatra" width={707} height={353} className="h-12 w-auto object-contain" style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }} />
                    </a>
                    <div className="flex items-center gap-6">
                        <Link href="/explore" className="text-xs font-black uppercase tracking-widest" style={{ color: T.border }}>Explore</Link>
                        <Link href="/pricing" className="text-xs font-black uppercase tracking-widest hover:opacity-80" style={{ color: `${T.cream}70` }}>Pricing</Link>
                        <Link href="/signin" className="text-xs font-black uppercase tracking-widest hover:opacity-80" style={{ color: `${T.cream}70` }}>Sign In</Link>
                        <Link href="/signup" className="flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider" style={{ background: T.border, color: BASE.ink }}>
                            Start Free →
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ── Hero Banner (Jaipur) ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
                <Image src={jaipurImg} alt="Jaipur" fill className="object-cover object-center" style={{ opacity: 0.45 }} priority />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${T.bg} 0%, transparent 60%)` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pb-8">
                    <div className="flex items-center gap-3">
                        <Globe size={18} style={{ color: T.border }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Public Form Gallery</span>
                    </div>
                    <h1 className="font-black text-5xl uppercase tracking-tight text-center" style={{ color: T.cream }}>
                        Explore <span style={{ color: T.border }}>Forms</span>
                    </h1>
                    <p className="text-sm font-medium text-center" style={{ color: `${T.cream}70` }}>
                        Browse and fill public forms shared by the community.
                    </p>
                </div>
            </div>

            <FolkPatternStrip />

            {/* ── Search + Grid ── */}
            <div className="flex-1 px-6 py-10 flex flex-col items-center">
                <div className="w-full max-w-5xl flex flex-col gap-8">
                    {/* Search bar */}
                    <div className="relative max-w-md mx-auto w-full">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: `${T.cream}50` }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search forms..."
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                            style={{ background: T.panel, border: `1.5px solid ${T.border}40`, color: T.cream }}
                            onFocus={e => e.currentTarget.style.borderColor = T.border}
                            onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                        />
                    </div>

                    {isLoading ? (
                        <div className="py-24 text-center text-sm font-bold uppercase tracking-widest" style={{ color: `${T.cream}50` }}>
                            Loading forms...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-24 rounded-2xl" style={{ border: `2px dashed ${T.border}40`, background: `${T.panel}50` }}>
                            <FileText size={40} style={{ color: `${T.border}50` }} />
                            <div className="text-center">
                                <p className="font-bold text-lg" style={{ color: T.cream }}>{search ? "No forms match your search." : "No public forms yet."}</p>
                                <p className="text-sm mt-1" style={{ color: `${T.cream}60` }}>Be the first to create and publish a form!</p>
                            </div>
                            <Link href="/signup" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider" style={{ background: T.border, color: BASE.ink }}>
                                Create a Form
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${T.cream}50` }}>
                                {filtered.length} form{filtered.length !== 1 ? "s" : ""} found
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filtered.map((form) => (
                                    <article
                                        key={form.id}
                                        className="relative p-6 rounded-xl flex flex-col gap-4 overflow-hidden group transition-transform hover:-translate-y-1"
                                        style={{ background: T.panel, border: `1px solid ${T.border}30` }}
                                    >
                                        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ background: T.border }} />

                                        <div className="relative z-10 flex items-center gap-2">
                                            <span className="w-7 h-7 rounded flex items-center justify-center" style={{ background: `${T.border}20` }}>
                                                <Globe size={13} style={{ color: T.border }} />
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Public</span>
                                        </div>

                                        <div className="relative z-10 flex flex-col gap-1 flex-1">
                                            <h2 className="text-xl font-black uppercase tracking-tight line-clamp-1" style={{ color: T.cream }}>{form.title}</h2>
                                            <p className="text-sm font-medium line-clamp-3 min-h-[60px]" style={{ color: `${T.cream}70` }}>
                                                {form.description || "Fill out this form to submit your response."}
                                            </p>
                                        </div>

                                        <div className="relative z-10 pt-4" style={{ borderTop: `1px solid ${T.border}20` }}>
                                            <Link
                                                href={`/form/${form.id}`}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors hover:opacity-90"
                                                style={{ background: T.border, color: BASE.ink }}
                                            >
                                                Open Form <ArrowRight size={13} />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <FolkPatternStrip />
        </main>
    );
}
