"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSignin } from "~/hooks/api/auth";
import logoImg from "~/assets/form-yatra-logo.png";
import goaImg from "~/assets/goa.png";
import { themes, PATTERN_TILE, getFolkPatternSvg, BASE } from "~/lib/theme";

const T = themes.goa;
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

export default function SigninPage() {
    const router = useRouter();
    const { signInUserWithEmailAndPasswordAsync, isPending, isSuccess, error } = useSignin();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signInUserWithEmailAndPasswordAsync({ email, password });
        router.push("/dashboard/forms");
    };

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}
        >
            {/* ── Header (nav bg = panel bg = pattern bg — one unified frame) ── */}
            <header className="w-full shrink-0" style={{ background: T.nav }}>
                <nav className="w-full px-10 py-3 flex items-center justify-between">
                    <a href="/" className="flex items-center">
                        <Image
                            src={logoImg}
                            alt="FormYatra"
                            width={707}
                            height={353}
                            className="h-16 w-auto object-contain"
                            priority
                        />
                    </a>
                    <p className="text-sm font-semibold" style={{ color: `${T.cream}60` }}>
                        No account?{" "}
                        <a href="/signup" style={{ color: T.border }} className="hover:underline">Sign up</a>
                    </p>
                </nav>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 flex-col min-h-0">
                <FolkPatternStrip />

                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* LEFT — Goa illustration */}
                    <div className="hidden lg:block flex-1 relative overflow-hidden">
                        <Image
                            src={goaImg}
                            alt="Goa coastal illustration"
                            fill
                            className="object-cover object-center"
                            quality={95}
                        />
                        {/* Blend right edge into form panel */}
                        <div className="absolute inset-y-0 right-0 w-40 pointer-events-none z-10"
                            style={{ background: `linear-gradient(to right, transparent, ${T.panel})` }} />
                        {/* Top/bottom folk-band blends */}
                        <div className="absolute top-0 inset-x-0 z-10 pointer-events-none"
                            style={{ height: PATTERN_TILE * 2, background: `linear-gradient(to bottom, ${T.panel} 0%, transparent 100%)` }} />
                        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
                            style={{ height: PATTERN_TILE * 2, background: `linear-gradient(to top, ${T.panel} 0%, transparent 100%)` }} />

                        {/* City chip */}
                        <div
                            className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                            style={{ background: T.panel, border: `1.5px solid ${T.border}`, color: T.border }}
                        >
                            📍 Goa
                        </div>
                    </div>

                    {/* RIGHT — Sign in form panel (same structure as home left panel) */}
                    <div
                        className="flex flex-col h-full w-full lg:max-w-[44%] shrink-0"
                        style={{ background: T.panel, borderLeft: `3px solid ${T.border}` }}
                    >
                        {/* Top: pattern fill spacer (fills gap above content) */}
                        <div className="flex-1 min-h-0 flex flex-col justify-end overflow-hidden">
                            <div
                                className="w-full flex-1 max-h-36 min-h-[40px]"
                                style={folkPatternStyle}
                                aria-hidden
                            />
                        </div>

                        {/* Content — shrink-0, never stretches */}
                        <div className="shrink-0 flex flex-col gap-7 px-12">

                            {/* Top ornament */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1" style={{ background: `${T.border}40` }} />
                                <span style={{ color: T.border }}>✦</span>
                                <div className="h-px flex-1" style={{ background: `${T.border}40` }} />
                            </div>

                            <div>
                                <h1 className="font-black text-4xl uppercase tracking-tight leading-[1.05]"
                                    style={{ color: T.cream }}>
                                    Welcome<br /><span style={{ color: T.border }}>Back</span>
                                </h1>
                                <p className="mt-2 text-sm font-medium" style={{ color: `${T.cream}70` }}>
                                    Sign in to continue your yatra.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all"
                                        style={{ background: `${T.softCream}12`, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                        onFocus={e => e.currentTarget.style.borderColor = T.border}
                                        onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all"
                                        style={{ background: `${T.softCream}12`, border: `1.5px solid ${T.border}40`, color: T.cream }}
                                        onFocus={e => e.currentTarget.style.borderColor = T.border}
                                        onBlur={e => e.currentTarget.style.borderColor = `${T.border}40`}
                                    />
                                </div>

                                {error && <p className="text-sm font-semibold" style={{ color: "#f87171" }}>{error.message}</p>}
                                {isSuccess && <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>Signed in!</p>}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ background: T.border, color: BASE.ink }}
                                >
                                    {isPending ? "Signing in…" : "Sign In →"}
                                </button>
                            </form>

                            {/* Bottom ornament */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1" style={{ background: `${T.border}40` }} />
                                <span style={{ color: T.border }}>❋</span>
                                <div className="h-px flex-1" style={{ background: `${T.border}40` }} />
                            </div>
                        </div>

                        {/* Bottom: balanced spacer (mirrors home page) */}
                        <div className="flex-1 min-h-0" aria-hidden />
                    </div>
                </div>

                <FolkPatternStrip />
            </div>
        </main>
    );
}
