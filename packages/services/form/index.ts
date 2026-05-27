import { db, eq, and } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionsTable } from "@repo/database/models/form-submission";

import {
    createFormInput,
    type CreateFormInputType,
    listFormsByUserIdInput,
    type ListFormsByUserIdInputType,
    updateFormInput,
    type UpdateFormInputType,
    deleteFormInput,
    type DeleteFormInputType,
} from "./model";

export default class UserService {
    public async createForm(payload: CreateFormInputType) {
        const { title, description, visibility, status, createdBy, fields } = await createFormInput.parseAsync(payload);

        const result = await db
            .insert(formsTable)
            .values({
                title,
                description,
                visibility,
                status,
                createdBy,
            })
            .returning({
                id: formsTable.id,
            });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the form");

        if (fields && fields.length > 0) {
            for (let i = 0; i < fields.length; i++) {
                const f = fields[i]!;
                await db.insert(formFieldsTable).values({
                    formId: result[0].id,
                    label: f.label,
                    labelKey: f.label.toLowerCase().replace(/\s+/g, "_"),
                    type: f.type,
                    placeholder: f.placeholder,
                    isRequired: f.isRequired,
                    index: String(i),
                    options: f.options,
                });
            }
        }

        return {
            id: result[0].id,
        };
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload);

        const forms = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                visibility: formsTable.visibility,
                status: formsTable.status,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId));

        return forms;
    }

    public async listPublicForms() {
        const forms = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                createdAt: formsTable.createdAt,
            })
            .from(formsTable)
            .where(and(
                eq(formsTable.visibility, "PUBLIC"),
                eq(formsTable.status, "PUBLISHED")
            ))
            .limit(50);

        return forms;
    }

    public async getFormWithFields(formId: string, userId?: string) {
        const rows = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                visibility: formsTable.visibility,
                status: formsTable.status,
                createdBy: formsTable.createdBy,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,

                field_id: formFieldsTable.id,
                field_formId: formFieldsTable.formId,
                field_label: formFieldsTable.label,
                field_labelKey: formFieldsTable.labelKey,
                field_description: formFieldsTable.description,
                field_placeholder: formFieldsTable.placeholder,
                field_isRequired: formFieldsTable.isRequired,
                field_index: formFieldsTable.index,
                field_type: formFieldsTable.type,
                field_options: formFieldsTable.options,
                field_createdAt: formFieldsTable.createdAt,
                field_updatedAt: formFieldsTable.updatedAt,
            })
            .from(formsTable)
            .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
            .where(eq(formsTable.id, formId))
            .orderBy(formFieldsTable.index);

        /*
        {formdetails, field details},
        {formdetails, field details},
        {formdetails, field details}
            */

        if (!rows || rows.length === 0) throw new Error(`Form with ID ${formId} not found`);

        const first = rows[0]!;

        if (first.status === "UNPUBLISHED" && first.createdBy !== userId) {
            throw new Error("Form is unpublished or unavailable");
        }

        const form = {
            id: first.id,
            title: first.title,
            description: first.description ?? null,
            visibility: first.visibility,
            status: first.status,
            createdAt: first.createdAt ? first.createdAt.toISOString() : null,
            updatedAt: first.updatedAt ? first.updatedAt.toISOString() : null,
            fields: [] as Array<any>,
        };

        for (const r of rows) {
            if (!r.field_id) continue;

            form.fields.push({
                id: r.field_id,
                formId: r.field_formId,
                label: r.field_label,
                labelKey: r.field_labelKey,
                description: r.field_description ?? null,
                placeholder: r.field_placeholder ?? null,
                isRequired: r.field_isRequired,
                index: r.field_index!.toString(),
                type: r.field_type,
                options: r.field_options ?? null,
                createdAt: r.field_createdAt ? r.field_createdAt.toISOString() : null,
                updatedAt: r.field_updatedAt ? r.field_updatedAt.toISOString() : null,
            });
        }

        return form;
    }

    public async updateForm(payload: UpdateFormInputType) {
        const { id, title, description, visibility, status, userId } = await updateFormInput.parseAsync(payload);

        // Security check: only creator can update
        const existing = await db.select({ createdBy: formsTable.createdBy }).from(formsTable).where(eq(formsTable.id, id));
        if (!existing || existing.length === 0) throw new Error("Form not found");
        if (existing[0]!.createdBy !== userId) throw new Error("Unauthorized to update this form");

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (visibility !== undefined) updateData.visibility = visibility;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length === 0) return { id };

        const result = await db.update(formsTable).set(updateData).where(eq(formsTable.id, id)).returning({ id: formsTable.id });
        if (!result || result.length === 0) throw new Error("Failed to update form");
        return { id: result[0]!.id };
    }

    public async deleteForm(payload: DeleteFormInputType) {
        const { id, userId } = await deleteFormInput.parseAsync(payload);

        const existing = await db.select({ createdBy: formsTable.createdBy }).from(formsTable).where(eq(formsTable.id, id));
        if (!existing || existing.length === 0) throw new Error("Form not found");
        if (existing[0]!.createdBy !== userId) throw new Error("Unauthorized to delete this form");

        // Note: You should delete fields and submissions related to this form, 
        // or ensure DB constraints handle cascading deletes.
        await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, id));
        const result = await db.delete(formsTable).where(eq(formsTable.id, id)).returning({ id: formsTable.id });
        
        if (!result || result.length === 0) throw new Error("Failed to delete form");
        return { success: true };
    }

    public async getFormAnalytics(formId: string, userId: string) {
        // Auth check
        const formRows = await db.select({ createdBy: formsTable.createdBy }).from(formsTable).where(eq(formsTable.id, formId));
        if (!formRows || formRows.length === 0) throw new Error("Form not found");
        if (formRows[0]!.createdBy !== userId) throw new Error("Unauthorized");

        // Get all submissions
        const submissions = await db
            .select()
            .from(formSubmissionsTable)
            .where(eq(formSubmissionsTable.formId, formId));

        // Get all fields
        const fields = await db
            .select({ id: formFieldsTable.id, label: formFieldsTable.label, type: formFieldsTable.type })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(formFieldsTable.index);

        // Submissions per day
        const dayMap = new Map<string, number>();
        for (const s of submissions) {
            const day = s.createdAt ? s.createdAt.toISOString().slice(0, 10) : "unknown";
            dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
        }
        const submissionsPerDay = Array.from(dayMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }));

        // Field breakdown for choice fields
        const CHOICE_TYPES = ["SINGLE_SELECT", "MULTI_SELECT", "CHECKBOX", "RATING"];
        const fieldBreakdown = fields.map((field) => {
            const valueCounts = new Map<string, number>();
            for (const s of submissions) {
                const vals = s.values ?? [];
                const entry = vals.find((v: any) => v.fieldId === field.id);
                if (!entry?.value) continue;
                const parts = field.type === "MULTI_SELECT" ? entry.value.split("|||") : [entry.value];
                for (const p of parts) {
                    if (p) valueCounts.set(p, (valueCounts.get(p) ?? 0) + 1);
                }
            }
            return {
                fieldId: field.id,
                fieldLabel: field.label,
                fieldType: field.type,
                valueCounts: CHOICE_TYPES.includes(field.type)
                    ? Array.from(valueCounts.entries()).map(([value, count]) => ({ value, count }))
                    : [],
            };
        });

        return {
            totalSubmissions: submissions.length,
            submissionsPerDay,
            fieldBreakdown,
        };
    }

    public async cloneForm(formId: string, userId: string) {
        // Get original form
        const origForms = await db.select().from(formsTable).where(eq(formsTable.id, formId));
        if (!origForms || origForms.length === 0) throw new Error("Form not found");
        const orig = origForms[0]!;
        if (orig.createdBy !== userId) throw new Error("Unauthorized");

        // Insert new form
        const newForm = await db.insert(formsTable).values({
            title: `${orig.title} (Copy)`,
            description: orig.description,
            visibility: orig.visibility,
            status: "UNPUBLISHED",
            createdBy: userId,
        }).returning({ id: formsTable.id });

        if (!newForm || !newForm[0]?.id) throw new Error("Failed to clone form");
        const newFormId = newForm[0].id;

        // Clone fields
        const fields = await db.select().from(formFieldsTable).where(eq(formFieldsTable.formId, formId)).orderBy(formFieldsTable.index);
        for (const f of fields) {
            await db.insert(formFieldsTable).values({
                formId: newFormId,
                label: f.label,
                labelKey: f.labelKey,
                description: f.description,
                placeholder: f.placeholder,
                isRequired: f.isRequired,
                index: f.index,
                type: f.type,
                options: f.options,
            });
        }

        return { id: newFormId };
    }
}
