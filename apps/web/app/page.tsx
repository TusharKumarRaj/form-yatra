"use client";

import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import jaipurImg from "~/assets/jaipur.png";
import logoImg from "~/assets/form-yatra-logo.png";

// ── Dosti-inspired folk-art palette ──────────────────────────────
const C = {
    bg: "#143d27",   // warm forest backdrop (replaces harsh #0c2620 teal)
    nav: "#1d5c3a",   // header bar — matches folk-pattern green
    green: "#1d5c3a",   // rich forest green panel
    gold: "#e8a020",   // warm amber / folk pattern gold
    cream: "#f5f0e0",   // off-white text
    softCream: "#fdf5e4",
    darkGreen: "#0f2a1c",
    ink: "#0f1f18",   // dark text on gold buttons
};

const PATTERN_TILE = 40;

// Seamless 40×40 tile (no edge ornaments — avoids repeat seams)
const folkPatternSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231d5c3a'/%3E%3Cpolygon points='20,4 36,20 20,36 4,20' fill='none' stroke='%23e8a020' stroke-width='1.5'/%3E%3Ccircle cx='20' cy='20' r='2.5' fill='%23e8a020'/%3E%3C/svg%3E")`;

const folkPatternStyle = {
    backgroundImage: folkPatternSvg,
    backgroundSize: `${PATTERN_TILE}px ${PATTERN_TILE}px`,
    backgroundRepeat: "repeat",
    backgroundPosition: "0 0",
} as const;

function FolkPatternStrip({ className = "" }: { className?: string }) {
    return (
        <div
            className={`w-full shrink-0 overflow-hidden ${className}`}
            style={{ ...folkPatternStyle, height: PATTERN_TILE }}
            aria-hidden
        />
    );
}

export default function Home() {
    const { user } = useUser();
    const router = useRouter();

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}
        >
            {/* ── Header: nav + folk divider (unified green band) ─── */}
            <header className="w-full shrink-0" style={{ background: C.nav }}>
                <nav
                    className="w-full px-10 py-3 flex items-center justify-between"
                >
                    <div className="flex items-center">
                        <Image
                            src={logoImg}
                            alt="FormYatra"
                            width={707}
                            height={353}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: `${C.cream}80` }}>
                        <a href="/explore" className="hover:text-[#e8a020] transition-colors">Explore</a>
                        <a href="/templates" className="hover:text-[#e8a020] transition-colors">Templates</a>
                        <a href="/pricing" className="hover:text-[#e8a020] transition-colors">Pricing</a>
                        <a href="/docs" className="hover:text-[#e8a020] transition-colors">Docs</a>
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.id ? (
                            <button
                                onClick={() => router.push("/dashboard/forms")}
                                className="px-5 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                                style={{ background: C.gold, color: C.ink }}
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push("/signin")}
                                    className="px-4 py-2 text-sm font-semibold transition-colors"
                                    style={{ color: `${C.cream}70` }}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => router.push("/signup")}
                                    className="px-5 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                                    style={{ background: C.gold, color: C.ink }}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* ── Hero — pattern band above & below the split layout ─ */}
            <div className="flex flex-1 flex-col min-h-0">
                <FolkPatternStrip />

                <div className="flex flex-1 min-h-0 overflow-hidden relative">

                    {/* LEFT — folk-art green panel with content */}
                    <div
                        className="flex flex-col h-full min-h-0 shrink-0 relative z-10"
                        style={{
                            width: "50%",
                            background: C.green,
                            borderRight: `3px solid ${C.gold}`,
                        }}
                    >
                        {/* Pattern fills the gap between the top strip and the ✦ line */}
                        <div className="flex-1 min-h-0 flex flex-col justify-end overflow-hidden">
                            <div
                                className="w-full overflow-hidden flex-1 max-h-36 min-h-[40px]"
                                style={folkPatternStyle}
                                aria-hidden
                            />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8 px-12 shrink-0">
                            {/* Divider ornament */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1" style={{ background: `${C.gold}50` }} />
                                <span className="text-lg" style={{ color: C.gold }}>✦</span>
                                <div className="h-px flex-1" style={{ background: `${C.gold}50` }} />
                            </div>

                            {/* Headline */}
                            <div>
                                <h1
                                    className="font-black leading-[1.0] tracking-tight uppercase"
                                    style={{ fontSize: "clamp(3rem, 5vw, 5rem)", color: C.cream }}
                                >
                                    Build<br />
                                    <span style={{ color: C.gold }}>Beautiful</span><br />
                                    Forms
                                </h1>
                            </div>

                            {/* Tag line */}
                            <p className="text-base leading-relaxed max-w-sm font-medium" style={{ color: `${C.cream}90` }}>
                                A form builder inspired by the spirit of India’s cities. From the energy of Mumbai to the calm of Kerala, every form feels alive. Create, publish, and analyze beautifully crafted experiences.
                            </p>

                            {/* Divider ornament */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1" style={{ background: `${C.gold}50` }} />
                                <span className="text-lg" style={{ color: C.gold }}>❋</span>
                                <div className="h-px flex-1" style={{ background: `${C.gold}50` }} />
                            </div>

                            {/* Attribute tags — like "AROMATIC · CITRUSY · EARTHY" */}
                            <div className="flex gap-0 text-xs font-black tracking-widest uppercase" style={{ color: C.gold }}>
                                {["City Themes", "Easy Sharing", "Analytics"].map((tag, i) => (
                                    <span key={tag} className="flex items-center gap-0">
                                        {i > 0 && <span className="mx-3" style={{ color: `${C.gold}50` }}>|</span>}
                                        <span>{tag}</span>
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8">
                                {[["2,400+", "Forms Created"], ["98%", "Uptime"], ["4.9★", "Rating"]].map(([v, l]) => (
                                    <div key={l}>
                                        <div className="text-2xl font-black" style={{ color: C.gold }}>{v}</div>
                                        <div className="text-xs font-semibold mt-0.5" style={{ color: `${C.cream}60` }}>{l}</div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-3 mb-3">
                                <button
                                    onClick={() => router.push(user?.id ? "/dashboard/forms" : "/signup")}
                                    className="px-7 py-3.5 rounded-lg font-black text-base uppercase tracking-wider transition-opacity hover:opacity-90"
                                    style={{ background: C.gold, color: C.ink }}
                                >
                                    Start Building
                                </button>
                                <button
                                    onClick={() => router.push("/explore")}
                                    className="px-7 py-3.5 rounded-lg font-bold text-base transition-all"
                                    style={{ border: `2px solid ${C.gold}60`, color: `${C.cream}80` }}
                                >
                                    View Demo →
                                </button>
                            </div>

                        </div>

                        {/* Balances vertical centering so pattern sits just above ✦ */}
                        <div className="flex-1 min-h-0" aria-hidden />
                    </div>

                    {/* RIGHT — Jaipur illustration fills the panel */}
                    <div className="flex-1 relative overflow-hidden">
                        <Image
                            src={jaipurImg}
                            alt="Jaipur city illustration"
                            fill
                            className="object-cover object-center"
                            priority
                            quality={95}
                        />

                        {/* Blend top/bottom edges into the folk-pattern bands */}
                        <div
                            className="absolute top-0 left-0 right-0 z-[1] pointer-events-none"
                            style={{
                                height: PATTERN_TILE * 2,
                                background: `linear-gradient(to bottom, ${C.green} 0%, ${C.green}55 45%, transparent 100%)`,
                            }}
                        />
                        <div
                            className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
                            style={{
                                height: PATTERN_TILE * 2,
                                background: `linear-gradient(to top, ${C.green} 0%, ${C.green}55 45%, transparent 100%)`,
                            }}
                        />

                        {/* Warm tint so it feels part of the palette */}
                        <div
                            className="absolute inset-0 z-[1]"
                            style={{ background: `${C.bg}40`, mixBlendMode: "multiply" }}
                        />

                        {/* Floating form preview card */}
                        <div
                            className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-72 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl"
                            style={{
                                background: C.softCream,
                                border: `2px solid ${C.gold}`,
                                boxShadow: `0 0 0 6px ${C.green}40, 0 20px 60px rgba(0,0,0,0.4)`
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.darkGreen }}>Customer Feedback</span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#d4edda", color: "#276221" }}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                        Live
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.green }}>Your Name</label>
                                    <div className="px-3 py-2.5 rounded-lg text-sm font-medium bg-white" style={{ border: `1.5px solid ${C.green}30`, color: C.darkGreen }}>
                                        John Doe
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.green }}>Overall Experience</label>
                                    <div className="flex gap-1 text-xl">
                                        {"★★★★☆".split("").map((s, i) => (
                                            <span key={i} style={{ color: i < 4 ? C.gold : `${C.darkGreen}25` }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.green }}>How did you find us?</label>
                                    <div className="px-3 py-2.5 rounded-lg text-sm font-medium bg-white flex justify-between items-center" style={{ border: `1.5px solid ${C.green}30`, color: C.darkGreen }}>
                                        <span>Social Media</span>
                                        <span style={{ color: `${C.darkGreen}50` }}>▼</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-2.5 rounded-lg font-black text-sm uppercase tracking-wider"
                                    style={{ background: C.green, color: C.gold }}
                                >
                                    Submit Response →
                                </button>
                            </div>
                        </div>

                        {/* City label chip */}
                        <div
                            className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                            style={{ background: C.green, border: `1.5px solid ${C.gold}`, color: C.gold }}
                        >
                            📍 Jaipur
                        </div>
                    </div>
                </div>

                <FolkPatternStrip />
            </div>
        </main>
    );
}
