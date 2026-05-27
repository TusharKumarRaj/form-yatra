"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Copy, Plus, Star, Users, Film, Gamepad2, Rocket, Code2, Coffee } from "lucide-react";
import { toast } from "sonner";

import { useCreateForm } from "~/hooks/api/form";
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

const TEMPLATES = [
    {
        id: "startup-feedback",
        title: "Startup Product Feedback",
        description: "Gather crucial early-stage feedback from your beta testers.",
        icon: Rocket,
        color: "#f87171",
        fields: [
            { label: "What is your role?", type: "SINGLE_SELECT", tempOptions: ["Founder", "Engineer", "Designer", "Product Manager", "Other"], isRequired: true },
            { label: "How would you rate the core feature?", type: "RATING", isRequired: true },
            { label: "What is the ONE thing we should build next?", type: "LONG_TEXT", isRequired: true },
            { label: "Any bugs you noticed?", type: "LONG_TEXT", isRequired: false },
        ]
    },
    {
        id: "game-signup",
        title: "Esports Tournament Signup",
        description: "Register teams for your upcoming gaming tournament.",
        icon: Gamepad2,
        color: "#a78bfa",
        fields: [
            { label: "Team Name", type: "SHORT_TEXT", isRequired: true },
            { label: "Captain's Email", type: "EMAIL", isRequired: true },
            { label: "Game Title", type: "SINGLE_SELECT", tempOptions: ["Valorant", "CS:GO", "Dota 2", "League of Legends", "Apex Legends"], isRequired: true },
            { label: "Number of players", type: "NUMBER", isRequired: true },
            { label: "Do you have a sub?", type: "CHECKBOX", isRequired: true },
        ]
    },
    {
        id: "movie-club",
        title: "Movie Club Voting",
        description: "Let your community vote on what to watch next week.",
        icon: Film,
        color: "#facc15",
        fields: [
            { label: "Your Name", type: "SHORT_TEXT", isRequired: true },
            { label: "Which genre are you feeling?", type: "MULTI_SELECT", tempOptions: ["Sci-Fi", "Thriller", "Rom-Com", "Action", "Documentary"], isRequired: true },
            { label: "Suggest a specific movie", type: "SHORT_TEXT", isRequired: false },
            { label: "Best day to watch?", type: "SINGLE_SELECT", tempOptions: ["Friday night", "Saturday afternoon", "Sunday night"], isRequired: true },
        ]
    },
    {
        id: "hackathon-rsvp",
        title: "Hackathon Registration",
        description: "Standard application form for a tech hackathon.",
        icon: Code2,
        color: "#4ade80",
        fields: [
            { label: "Full Name", type: "SHORT_TEXT", isRequired: true },
            { label: "Email Address", type: "EMAIL", isRequired: true },
            { label: "GitHub Profile URL", type: "SHORT_TEXT", isRequired: true },
            { label: "Dietary Restrictions", type: "MULTI_SELECT", tempOptions: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Nut Allergy"], isRequired: true },
            { label: "Will you need travel reimbursement?", type: "CHECKBOX", isRequired: true },
        ]
    },
    {
        id: "cafe-survey",
        title: "Coffee Shop Feedback",
        description: "Quick satisfaction survey for cafe customers.",
        icon: Coffee,
        color: "#c084fc",
        fields: [
            { label: "How was your coffee today?", type: "RATING", isRequired: true },
            { label: "What did you order?", type: "SINGLE_SELECT", tempOptions: ["Latte", "Cappuccino", "Americano", "Cold Brew", "Tea", "Pastry"], isRequired: true },
            { label: "How friendly was the staff?", type: "RATING", isRequired: true },
            { label: "Any suggestions for improvement?", type: "LONG_TEXT", isRequired: false },
        ]
    },
    {
        id: "community-join",
        title: "Community Onboarding",
        description: "Welcome new members and learn about their interests.",
        icon: Users,
        color: "#60a5fa",
        fields: [
            { label: "Preferred Name / Handle", type: "SHORT_TEXT", isRequired: true },
            { label: "Email", type: "EMAIL", isRequired: true },
            { label: "What are your primary interests?", type: "MULTI_SELECT", tempOptions: ["Networking", "Mentorship", "Events", "Job Hunting", "Hobby Chat"], isRequired: true },
            { label: "Tell us a bit about yourself", type: "LONG_TEXT", isRequired: true },
        ]
    }
];

export default function TemplatesGallery() {
    const router = useRouter();
    const { createFormAsync, status } = useCreateForm();

    const handleUseTemplate = async (template: typeof TEMPLATES[0]) => {
        try {
            const processedFields = template.fields.map(f => {
                if ((f.type === "SINGLE_SELECT" || f.type === "MULTI_SELECT") && f.tempOptions) {
                    return {
                        ...f,
                        options: { options: f.tempOptions }
                    };
                }
                return f;
            }) as any;

            const res = await createFormAsync({
                title: template.title,
                description: template.description,
                visibility: "PUBLIC",
                status: "UNPUBLISHED",
                fields: processedFields,
            });

            toast.success("Template copied!");
            router.push(`/dashboard/forms/${res.id}`);
        } catch (e) {
            toast.error("You must be signed in to use a template.");
            router.push("/signin");
        }
    };

    return (
        <main className="min-h-screen flex flex-col" style={{ background: T.bg, fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
            {/* Header */}
            <header className="w-full shrink-0 flex items-center justify-between px-10 py-6" style={{ background: T.nav, borderBottom: `2px solid ${T.border}` }}>
                <Link href="/" className="flex items-center gap-4 transition-transform hover:scale-105">
                    <Image src={logoImg} alt="FormYatra" width={707} height={353} className="h-10 w-auto object-contain" style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(35%) saturate(750%) hue-rotate(345deg) brightness(108%) contrast(90%)" }} />
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/explore" className="text-xs font-black uppercase tracking-widest transition-colors hover:opacity-80" style={{ color: T.cream }}>Explore Forms</Link>
                    <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-lg transition-transform hover:-translate-y-0.5" style={{ background: T.border, color: BASE.ink }}>Dashboard</Link>
                </div>
            </header>

            <div className="w-full shrink-0 overflow-hidden" style={{ ...folkPatternStyle, height: PATTERN_TILE }} aria-hidden />

            <div className="flex-1 px-6 py-16 w-full max-w-7xl mx-auto flex flex-col gap-16">
                
                {/* Hero section */}
                <div className="text-center flex flex-col items-center">
                    <span className="mb-4 text-3xl" style={{ color: T.border }}>❋</span>
                    <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight" style={{ color: T.cream }}>
                        Template <span style={{ color: T.border }}>Gallery</span>
                    </h1>
                    <p className="mt-6 text-lg font-medium max-w-2xl leading-relaxed" style={{ color: `${T.cream}80` }}>
                        Don't start from scratch. Choose a beautifully crafted template, customize it in the builder, and publish in seconds.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map(template => {
                        const Icon = template.icon;
                        return (
                            <div key={template.id} className="group relative p-8 rounded-2xl flex flex-col gap-6 overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{ background: T.panel, border: `1.5px solid ${T.border}30` }}>
                                {/* Deco shape */}
                                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ background: template.color }} />
                                
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 relative z-10" style={{ background: `${template.color}20`, color: template.color, border: `2px solid ${template.color}40` }}>
                                    <Icon size={24} />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <h2 className="text-xl font-black uppercase tracking-tight mb-2" style={{ color: T.cream }}>{template.title}</h2>
                                    <p className="text-sm font-medium leading-relaxed" style={{ color: `${T.cream}70` }}>{template.description}</p>
                                </div>

                                <div className="relative z-10 pt-6" style={{ borderTop: `1px solid ${T.border}20` }}>
                                    <button
                                        onClick={() => handleUseTemplate(template)}
                                        disabled={status === "pending"}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                                        style={{ background: T.border, color: BASE.ink }}
                                    >
                                        <Copy size={14} /> Use Template
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FolkPatternStrip />
        </main>
    );
}
