import { z } from "zod";
import { fieldOutputModel } from "../form-field/model";

export const createFormInputModel = z.object({
    title: z.string().max(55).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).optional().default("PUBLIC"),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional().default("UNPUBLISHED"),
    fields: z.array(z.object({
        label: z.string().min(1).max(55),
        type: z.enum(["SHORT_TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT", "CHECKBOX", "RATING", "DATE"]),
        placeholder: z.string().nullable().optional(),
        isRequired: z.boolean().default(false),
        options: z.object({ options: z.array(z.string()) }).nullable().optional(),
    })).optional(),
});

export const createFormOutputModel = z.object({
    id: z.string().describe("ID of the created form"),
});

export const listFormsInputModel = z.undefined();
export const listFormsOutputModel = z.array(
    z.object({
        id: z.string().describe("ID of the form"),
        title: z.string().describe("Title of the form"),
        description: z.string().nullable().optional().describe("Description of the form"),
        visibility: z.enum(["PUBLIC", "UNLISTED"]).describe("Visibility of the form"),
        status: z.enum(["PUBLISHED", "UNPUBLISHED"]).describe("Status of the form"),
        createdAt: z.date().nullable().describe("Creation timestamp"),
        updatedAt: z.date().nullable().describe("Last updated timestamp"),
    }),
);

export const listPublicFormsOutputModel = z.array(
    z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        createdAt: z.date().nullable(),
    }),
);

export const getFormInputModel = z.object({
    formId: z.uuid().describe("UUID of the form to fetch"),
});

export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    fields: z.array(fieldOutputModel),
});

export const updateFormInputModel = z.object({
    id: z.string(),
    title: z.string().max(55).optional(),
    description: z.string().max(300).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED"]).optional(),
});

export const updateFormOutputModel = z.object({
    id: z.string(),
});

export const deleteFormInputModel = z.object({
    id: z.string(),
});

export const deleteFormOutputModel = z.object({
    success: z.boolean(),
});

export const getFormAnalyticsInputModel = z.object({
    formId: z.uuid(),
});

export const getFormAnalyticsOutputModel = z.object({
    totalSubmissions: z.number(),
    submissionsPerDay: z.array(z.object({ date: z.string(), count: z.number() })),
    fieldBreakdown: z.array(z.object({
        fieldId: z.string(),
        fieldLabel: z.string(),
        fieldType: z.string(),
        valueCounts: z.array(z.object({ value: z.string(), count: z.number() })),
    })),
});

export const cloneFormInputModel = z.object({
    id: z.string(),
});

export const cloneFormOutputModel = z.object({
    id: z.string(),
});
