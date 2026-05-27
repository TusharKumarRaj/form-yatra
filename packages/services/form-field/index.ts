import { db, eq, max } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { createFieldInput, CreateFieldInputType, updateFieldInput, UpdateFieldInputType, deleteFieldInput, DeleteFieldInputType } from "./model";

function toLabelKey(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

export default class FormFieldService {
    private async getNextIndex(formId: string): Promise<string> {
        const result = await db
            .select({ maxIndex: max(formFieldsTable.index) })
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId));

        const current = result[0]?.maxIndex;
        const next = current ? Number(current) + 1 : 1;

        return next.toString();
    }

    public async createField(payload: CreateFieldInputType) {
        const { label, type, formId, description, placeholder, isRequired, options } =
            await createFieldInput.parseAsync(payload);

        const labelKey = toLabelKey(label);
        const index = await this.getNextIndex(formId);

        const result = await db
            .insert(formFieldsTable)
            .values({
                label,
                labelKey,
                type,
                formId,
                description,
                placeholder,
                isRequired,
                index,
                options,
            })
            .returning({ id: formFieldsTable.id });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the field");

        return { id: result[0].id, labelKey, index };
    }

    public async getFields(formId: string) {
        const result = await db
            .select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(formFieldsTable.index);

        return result.map((r) => ({
            id: r.id,
            formId: r.formId,
            label: r.label,
            labelKey: r.labelKey,
            description: r.description ?? null,
            placeholder: r.placeholder ?? null,
            isRequired: r.isRequired,
            index: r.index.toString(),
            type: r.type,
            options: r.options ?? null,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }

    public async updateField(payload: UpdateFieldInputType) {
        const { id, label, description, placeholder, isRequired, options } = await updateFieldInput.parseAsync(payload);

        const updateData: any = {};
        if (label !== undefined) {
            updateData.label = label;
            updateData.labelKey = toLabelKey(label);
        }
        if (description !== undefined) updateData.description = description;
        if (placeholder !== undefined) updateData.placeholder = placeholder;
        if (isRequired !== undefined) updateData.isRequired = isRequired;
        if (options !== undefined) updateData.options = options;

        if (Object.keys(updateData).length === 0) return { id };

        const result = await db.update(formFieldsTable).set(updateData).where(eq(formFieldsTable.id, id)).returning({ id: formFieldsTable.id });
        if (!result || result.length === 0) throw new Error("Failed to update field");
        
        return { id: result[0]!.id };
    }

    public async deleteField(payload: DeleteFieldInputType) {
        const { id } = await deleteFieldInput.parseAsync(payload);
        
        const result = await db.delete(formFieldsTable).where(eq(formFieldsTable.id, id)).returning({ id: formFieldsTable.id });
        if (!result || result.length === 0) throw new Error("Failed to delete field");
        
        return { success: true };
    }
}
