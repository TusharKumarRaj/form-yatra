import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(50).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).optional().default("PUBLIC"),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional().default("UNPUBLISHED"),
    createdBy: z.uuid().describe("UUID of the creator"),
    fields: z.array(z.object({
        label: z.string().min(1).max(55),
        type: z.enum(["SHORT_TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT", "CHECKBOX", "RATING", "DATE"]),
        placeholder: z.string().nullable().optional(),
        isRequired: z.boolean().default(false),
        options: z.object({ options: z.array(z.string()) }).nullable().optional(),
    })).optional(),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid().describe("UUID of the user"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const updateFormInput = z.object({
    id: z.uuid().describe("UUID of the form"),
    title: z.string().max(50).optional(),
    description: z.string().max(300).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
    userId: z.uuid().describe("UUID of the creator for security check"),
});

export const deleteFormInput = z.object({
    id: z.uuid().describe("UUID of the form"),
    userId: z.uuid().describe("UUID of the creator for security check"),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;
export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
