/**
 * FormYatra Seed Script
 * Run: pnpm db:seed
 *
 * Creates:
 *  - Demo user (demo@formyatra.in / demo123456)
 *  - 3 themed forms with fields (Customer Feedback, Event RSVP, Tech Survey)
 *  - Sample submissions for analytics
 */

import "dotenv/config";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionsTable } from "@repo/database/models/form-submission";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Seeding FormYatra demo data...");

    // ── 1. Create demo user ──────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("demo123456", 10);

    const existingUser = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, "demo@formyatra.in"));

    let userId: string;

    if (existingUser.length > 0) {
        userId = existingUser[0]!.id;
        console.log("  ✓ Demo user already exists:", userId);
    } else {
        const [newUser] = await db
            .insert(usersTable)
            .values({
                fullName: "Demo User",
                email: "demo@formyatra.in",
                passwordHash,
            })
            .returning({ id: usersTable.id });

        userId = newUser!.id;
        console.log("  ✓ Created demo user:", userId);
    }

    // ── Helper to seed a form ──────────────────────────────────────────
    async function seedForm(config: {
        title: string;
        description: string;
        visibility: "PUBLIC" | "UNLISTED";
        fields: Array<{
            label: string;
            type: "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";
            placeholder?: string;
            isRequired?: boolean;
            options?: string[];
        }>;
        sampleSubmissions?: Array<Record<string, string>>;
    }) {
        // Check if form already exists
        const existing = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(eq(formsTable.title, config.title));

        if (existing.length > 0) {
            console.log(`  ✓ Form already exists: "${config.title}"`);
            return;
        }

        const [form] = await db
            .insert(formsTable)
            .values({
                title: config.title,
                description: config.description,
                visibility: config.visibility,
                status: "PUBLISHED",
                createdBy: userId,
            })
            .returning({ id: formsTable.id });

        const formId = form!.id;
        console.log(`  ✓ Created form: "${config.title}" [${formId}]`);

        // Insert fields
        const fieldIds: Record<string, string> = {};
        for (let i = 0; i < config.fields.length; i++) {
            const f = config.fields[i]!;
            const [field] = await db
                .insert(formFieldsTable)
                .values({
                    formId,
                    label: f.label,
                    labelKey: f.label.toLowerCase().replace(/\s+/g, "_"),
                    type: f.type,
                    placeholder: f.placeholder,
                    isRequired: f.isRequired ?? false,
                    index: String(i),
                    options: f.options ? { options: f.options } : null,
                })
                .returning({ id: formFieldsTable.id });

            fieldIds[f.label] = field!.id;
        }
        console.log(`    ↳ Added ${config.fields.length} fields`);

        // Insert sample submissions
        if (config.sampleSubmissions) {
            for (const sub of config.sampleSubmissions) {
                const values = Object.entries(sub).map(([label, value]) => ({
                    fieldId: fieldIds[label] ?? "",
                    value,
                }));

                await db.insert(formSubmissionsTable).values({
                    formId,
                    values: values as any,
                });
            }
            console.log(`    ↳ Added ${config.sampleSubmissions.length} sample submissions`);
        }
    }

    // ── 2. Seed themed forms ──────────────────────────────────────────
    await seedForm({
        title: "Customer Feedback Survey",
        description: "Help us improve FormYatra by sharing your experience. Takes less than 2 minutes.",
        visibility: "PUBLIC",
        fields: [
            { label: "Full Name", type: "SHORT_TEXT", placeholder: "John Doe", isRequired: true },
            { label: "Email Address", type: "EMAIL", placeholder: "you@example.com", isRequired: true },
            { label: "How did you find us?", type: "SINGLE_SELECT", isRequired: true, options: ["Search Engine", "Social Media", "Friend / Colleague", "Product Hunt", "Newsletter"] },
            { label: "Overall Rating", type: "RATING", isRequired: true },
            { label: "Which features do you use?", type: "MULTI_SELECT", options: ["Form Builder", "Analytics", "Public Forms", "Share Links", "API Access"] },
            { label: "Any suggestions for improvement?", type: "LONG_TEXT", placeholder: "Tell us what you'd like to see..." },
        ],
        sampleSubmissions: [
            { "Full Name": "Priya Sharma", "Email Address": "priya@example.com", "How did you find us?": "Product Hunt", "Overall Rating": "5", "Which features do you use?": "Form Builder|||Analytics", "Any suggestions for improvement?": "Love the city themes! Would love more themes." },
            { "Full Name": "Arjun Kapoor", "Email Address": "arjun@example.com", "How did you find us?": "Search Engine", "Overall Rating": "4", "Which features do you use?": "Form Builder|||Share Links", "Any suggestions for improvement?": "Can you add conditional logic?" },
            { "Full Name": "Divya Menon", "Email Address": "divya@example.com", "How did you find us?": "Friend / Colleague", "Overall Rating": "5", "Which features do you use?": "Public Forms|||Analytics", "Any suggestions for improvement?": "The UI is stunning. Keep it up!" },
        ],
    });

    await seedForm({
        title: "Mumbai Tech Meetup RSVP",
        description: "Join us for an evening of tech talks, networking, and chai. RSVP to confirm your spot.",
        visibility: "PUBLIC",
        fields: [
            { label: "Your Name", type: "SHORT_TEXT", placeholder: "Full name", isRequired: true },
            { label: "Email", type: "EMAIL", placeholder: "your@email.com", isRequired: true },
            { label: "Company / Startup", type: "SHORT_TEXT", placeholder: "Where do you work?" },
            { label: "Role", type: "SINGLE_SELECT", isRequired: true, options: ["Engineer", "Designer", "Product Manager", "Founder", "Student", "Other"] },
            { label: "Which sessions interest you?", type: "MULTI_SELECT", options: ["AI & ML", "Web Development", "Mobile Apps", "DevOps & Cloud", "Open Source", "Career & Growth"] },
            { label: "Dietary requirements", type: "SINGLE_SELECT", options: ["No restrictions", "Vegetarian", "Vegan", "Jain"] },
            { label: "Will you attend?", type: "CHECKBOX", isRequired: true },
            { label: "Preferred date", type: "DATE", isRequired: true },
        ],
        sampleSubmissions: [
            { "Your Name": "Rohan Verma", "Email": "rohan@startup.io", "Company / Startup": "Startup.io", "Role": "Founder", "Which sessions interest you?": "AI & ML|||Web Development", "Dietary requirements": "Vegetarian", "Will you attend?": "true", "Preferred date": "2025-06-15" },
            { "Your Name": "Simran Bhatia", "Email": "simran@dev.co", "Company / Startup": "DevCo", "Role": "Engineer", "Which sessions interest you?": "Open Source|||DevOps & Cloud", "Dietary requirements": "Vegan", "Will you attend?": "true", "Preferred date": "2025-06-15" },
        ],
    });

    await seedForm({
        title: "India Developer State of AI 2025",
        description: "Annual survey on how Indian developers are using AI tools in their workflow. Results published publicly.",
        visibility: "PUBLIC",
        fields: [
            { label: "Name", type: "SHORT_TEXT", placeholder: "Optional", isRequired: false },
            { label: "Email", type: "EMAIL", placeholder: "Optional", isRequired: false },
            { label: "Years of experience", type: "SINGLE_SELECT", isRequired: true, options: ["< 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"] },
            { label: "Primary language", type: "SINGLE_SELECT", isRequired: true, options: ["JavaScript / TypeScript", "Python", "Go", "Rust", "Java", "C#", "Other"] },
            { label: "AI tools you use daily", type: "MULTI_SELECT", isRequired: true, options: ["GitHub Copilot", "ChatGPT", "Gemini", "Cursor", "Claude", "Codeium", "None"] },
            { label: "How has AI affected your productivity?", type: "RATING", isRequired: true },
            { label: "Your biggest concern about AI in dev?", type: "LONG_TEXT", placeholder: "Share your honest thoughts..." },
        ],
        sampleSubmissions: [
            { "Years of experience": "3–5 years", "Primary language": "JavaScript / TypeScript", "AI tools you use daily": "GitHub Copilot|||ChatGPT|||Cursor", "How has AI affected your productivity?": "5", "Your biggest concern about AI in dev?": "Code quality and over-reliance." },
            { "Years of experience": "1–3 years", "Primary language": "Python", "AI tools you use daily": "ChatGPT|||Gemini", "How has AI affected your productivity?": "4", "Your biggest concern about AI in dev?": "Job security and skill atrophy." },
        ],
    });

    console.log("\n✅ Seeding complete!\n");
    console.log("  Demo credentials:");
    console.log("    Email:    demo@formyatra.in");
    console.log("    Password: demo123456\n");

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
