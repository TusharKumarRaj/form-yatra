"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Zap, Shield, Building2, ArrowRight, Star } from "lucide-react";
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
    return <div className="w-full shrink-0 overflow-hidden" style={{ ...folkPatternStyle, height: PATTERN_TILE }} aria-hidden />;
}

const plans = [
    {
        name: "Free",
        icon: <Zap size={22} />,
        price: "₹0",
        period: "forever",
        description: "Perfect for individuals and small projects.",
        cta: "Start for Free",
        ctaHref: "/signup",
        highlighted: false,
        features: [
            "Up to 3 forms",
            "100 responses/month",
            "All 9 field types",
            "Public & Unlisted forms",
            "Share links",
            "Basic analytics",
            "FormYatra branding",
        ],
    },
    {
        name: "Pro",
        icon: <Star size={22} />,
        price: "₹699",
        period: "per month",
        description: "For creators who need more power and customisation.",
        cta: "Start 14-day trial",
        ctaHref: "/signup",
        highlighted: true,
        features: [
            "Unlimited forms",
            "10,000 responses/month",
            "All 9 field types",
            "Public & Unlisted forms",
            "Custom share links",
            "Advanced analytics & charts",
            "CSV export",
            "Email notifications",
            "Remove FormYatra branding",
            "Priority support",
        ],
    },
    {
        name: "Enterprise",
        icon: <Building2 size={22} />,
        price: "Custom",
        period: "contact us",
        description: "For large teams, compliance-heavy orgs, and platforms.",
        cta: "Contact Sales",
        ctaHref: "mailto:hello@formyatra.in",
        highlighted: false,
        features: [
            "Everything in Pro",
            "Unlimited responses",
            "SSO / SAML login",
            "Dedicated infrastructure",
            "SLA & uptime guarantees",
            "Audit logs",
            "Custom integrations",
            "Dedicated account manager",
        ],
    },
];

const faqs = [
    { q: "Is the free plan actually free?", a: "Yes. No credit card required. You get 3 forms and 100 responses per month, forever." },
    { q: "Can I publish forms without logging in?", a: "Respondents can fill and submit forms without an account. Only creators need to sign up." },
    { q: "What is an Unlisted form?", a: "Unlisted forms are published but hidden from the Explore gallery. Only people with the direct link can open them." },
    { q: "Is real payment integration available?", a: "FormYatra is currently in early access. Payments are coming soon. The Free plan is fully functional." },
];

export default function PricingPage() {
    return (
        <main className="min-h-screen flex flex-col" style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
            {/* ── Header ── */}
            <header className="w-full shrink-0" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <nav className="w-full px-10 py-3 flex items-center justify-between max-w-[1400px] mx-auto">
                    <a href="/" className="flex items-center gap-4">
                        <Image src={logoImg} alt="FormYatra" width={707} height={353} className="h-12 w-auto object-contain" style={{ filter: "brightness(0) saturate(100%) invert(74%) sepia(50%) saturate(800%) hue-rotate(5deg) brightness(108%) contrast(90%)" }} />
                    </a>
                    <div className="flex items-center gap-6">
                        <Link href="/explore" className="text-xs font-black uppercase tracking-widest hover:opacity-80" style={{ color: `${T.cream}70` }}>Explore</Link>
                        <Link href="/pricing" className="text-xs font-black uppercase tracking-widest" style={{ color: T.border }}>Pricing</Link>
                        <Link href="/signin" className="text-xs font-black uppercase tracking-widest hover:opacity-80" style={{ color: `${T.cream}70` }}>Sign In</Link>
                        <Link href="/signup" className="flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider" style={{ background: T.border, color: BASE.ink }}>
                            Start Free →
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ── Goa Hero ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
                <Image src={goaImg} alt="Goa coastline" fill className="object-cover object-center" style={{ opacity: 0.4 }} priority />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${T.bg} 0%, transparent 60%)` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: T.border }}>Simple, transparent pricing</span>
                    <h1 className="font-black text-5xl uppercase tracking-tight text-center" style={{ color: T.cream }}>
                        Pick Your <span style={{ color: T.border }}>Plan</span>
                    </h1>
                </div>
            </div>

            <FolkPatternStrip />

            {/* ── Plans ── */}
            <div className="flex-1 px-6 py-16 flex flex-col items-center gap-16">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className="relative flex flex-col gap-6 p-8 rounded-2xl overflow-hidden"
                            style={{
                                background: plan.highlighted ? `${T.border}15` : T.panel,
                                border: `2px solid ${plan.highlighted ? T.border : `${T.border}30`}`,
                                boxShadow: plan.highlighted ? `0 0 40px ${T.border}30` : "none",
                            }}
                        >
                            {plan.highlighted && (
                                <div className="absolute top-0 left-0 right-0 py-1.5 flex items-center justify-center" style={{ background: T.border }}>
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BASE.ink }}>Most Popular</span>
                                </div>
                            )}

                            <div className={plan.highlighted ? "mt-6" : ""}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg" style={{ background: `${T.border}20`, color: T.border }}>
                                        {plan.icon}
                                    </div>
                                    <h2 className="font-black text-xl uppercase tracking-tight" style={{ color: T.cream }}>{plan.name}</h2>
                                </div>

                                <div className="flex items-end gap-2 mb-2">
                                    <span className="font-black text-4xl" style={{ color: plan.highlighted ? T.border : T.cream }}>{plan.price}</span>
                                    <span className="text-sm font-bold pb-1" style={{ color: `${T.cream}60` }}>/{plan.period}</span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: `${T.cream}70` }}>{plan.description}</p>
                            </div>

                            <ul className="flex flex-col gap-2.5">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-2.5 text-sm font-medium" style={{ color: T.cream }}>
                                        <Check size={14} className="shrink-0 mt-0.5" style={{ color: T.border }} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.ctaHref}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-90 mt-auto"
                                style={{
                                    background: plan.highlighted ? T.border : "transparent",
                                    color: plan.highlighted ? BASE.ink : T.border,
                                    border: plan.highlighted ? "none" : `2px solid ${T.border}60`,
                                }}
                            >
                                {plan.cta} <ArrowRight size={15} />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* ── Feature comparison badge strip ── */}
                <div className="w-full max-w-5xl flex flex-wrap justify-center gap-3">
                    {["No credit card required", "Cancel anytime", "Lightning Fast", "Secure & Private", "Mobile Friendly", "Instant Analytics"].map((b) => (
                        <span key={b} className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: `${T.border}15`, color: T.border, border: `1px solid ${T.border}30` }}>
                            {b}
                        </span>
                    ))}
                </div>

                {/* ── FAQ ── */}
                <div className="w-full max-w-2xl flex flex-col gap-6">
                    <h2 className="font-black text-3xl uppercase tracking-tight text-center" style={{ color: T.cream }}>
                        Frequently Asked <span style={{ color: T.border }}>Questions</span>
                    </h2>
                    <div className="flex flex-col gap-4">
                        {faqs.map((faq) => (
                            <div key={faq.q} className="p-6 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}30` }}>
                                <p className="font-black text-sm uppercase tracking-wide mb-2" style={{ color: T.border }}>{faq.q}</p>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: `${T.cream}80` }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA ── */}
                <div className="w-full max-w-xl text-center flex flex-col items-center gap-5 py-12 rounded-2xl" style={{ background: T.panel, border: `2px solid ${T.border}30` }}>
                    <span className="text-3xl" style={{ color: T.border }}>❋</span>
                    <h2 className="font-black text-3xl uppercase tracking-tight" style={{ color: T.cream }}>
                        Ready to <span style={{ color: T.border }}>Start?</span>
                    </h2>
                    <p className="text-sm font-medium" style={{ color: `${T.cream}70` }}>Create your first form in under 2 minutes. Free, forever.</p>
                    <Link href="/signup" className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-opacity hover:opacity-90" style={{ background: T.border, color: BASE.ink }}>
                        Get Started Free <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            <FolkPatternStrip />
        </main>
    );
}
