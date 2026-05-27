import { db, eq } from "@repo/database";
import { formSubmissionsTable } from "@repo/database/models/form-submission";
import { formsTable } from "@repo/database/models/form";
import { createSubmissionInput, CreateSubmissionInputType } from "./model";
export default class FormSubmissionService {
    public async createSubmission(payload: CreateSubmissionInputType) {
        const { formId, values } = await createSubmissionInput.parseAsync(payload);

        // Fetch form to check if it's published and check limits
        const formResult = await db
            .select({
                status: formsTable.status,
                maxResponses: formsTable.maxResponses,
                expiresAt: formsTable.expiresAt,
            })
            .from(formsTable)
            .where(eq(formsTable.id, formId));

        if (!formResult || formResult.length === 0) {
            throw new Error("Form not found");
        }

        const form = formResult[0]!;

        if (form.status === "UNPUBLISHED") {
            throw new Error("Form is unpublished and cannot accept responses");
        }

        if (form.expiresAt && new Date() > form.expiresAt) {
            throw new Error("Form has expired and is no longer accepting responses");
        }

        if (form.maxResponses !== null) {
            const currentSubmissions = await db
                .select({ id: formSubmissionsTable.id })
                .from(formSubmissionsTable)
                .where(eq(formSubmissionsTable.formId, formId));
            if (currentSubmissions.length >= form.maxResponses) {
                throw new Error("Form has reached the maximum number of responses");
            }
        }

        const result = await db
            .insert(formSubmissionsTable)
            .values({ formId, values })
            .returning({ id: formSubmissionsTable.id, createdAt: formSubmissionsTable.createdAt });

        if (!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the submission");

        return {
            id: result[0].id,
            createdAt: result[0].createdAt ? result[0].createdAt.toISOString() : null,
        };
    }

    public async getSubmissionsByFormId(formId: string) {
        const rows = await db
            .select({
                id: formSubmissionsTable.id,
                formId: formSubmissionsTable.formId,
                values: formSubmissionsTable.values,
                createdAt: formSubmissionsTable.createdAt,
                updatedAt: formSubmissionsTable.updatedAt,
            })
            .from(formSubmissionsTable)
            .where(eq(formSubmissionsTable.formId, formId))
            .orderBy(formSubmissionsTable.createdAt);

        return rows.map((r) => ({
            id: r.id,
            formId: r.formId,
            values: r.values ?? [],
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }
}
