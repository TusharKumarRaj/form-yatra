import { z } from "zod";

const fieldTypeEnum = z.enum([
    "SHORT_TEXT",
    "LONG_TEXT",
    "EMAIL",
    "NUMBER",
    "SINGLE_SELECT",
    "MULTI_SELECT",
    "CHECKBOX",
    "RATING",
    "DATE"
]);

export const createFieldInput = z.object({
    label: z.string().max(100).describe("Display label for the field"),
    type: fieldTypeEnum.describe("Type of the field"),
    formId: z.uuid().describe("UUID of the form this field belongs to"),
    description: z.string().optional().describe("Helper text shown below the field"),
    placeholder: z.string().optional().describe("Placeholder text for the field"),
    isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
    options: z.object({ options: z.array(z.string()) }).optional().describe("Options for select fields"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const getFieldsInput = z.object({
    formId: z.uuid().describe("UUID of the form to fetch the fields for"),
});

export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

export const updateFieldInput = z.object({
    id: z.uuid().describe("UUID of the field"),
    label: z.string().max(100).optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().optional(),
    options: z.object({ options: z.array(z.string()) }).optional(),
});

export const deleteFieldInput = z.object({
    id: z.uuid().describe("UUID of the field"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;
