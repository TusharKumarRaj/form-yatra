import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, userService } from "../../services";

import {
    createFormInputModel,
    createFormOutputModel,
    listFormsInputModel,
    listFormsOutputModel,
    getFormInputModel,
    getFormOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
    deleteFormInputModel,
    deleteFormOutputModel,
    listPublicFormsOutputModel,
    getFormAnalyticsInputModel,
    getFormAnalyticsOutputModel,
    cloneFormInputModel,
    cloneFormOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { title, description, visibility, status, fields } = input;

            const { id } = await formService.createForm({
                title,
                description,
                visibility,
                status,
                fields,
                createdBy: ctx.user.id,
            });

            return { id };
        }),
    listForms: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/listForms"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(listFormsInputModel)
        .output(listFormsOutputModel)
        .query(async ({ ctx }) => {
            const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
            return forms;
        }),
    listPublicForms: publicProcedure
        .meta({
            openapi: { method: "GET", path: getPath("/listPublicForms"), tags: TAGS },
        })
        .input(listFormsInputModel)
        .output(listPublicFormsOutputModel)
        .query(async () => {
            const forms = await formService.listPublicForms();
            return forms;
        }),
    getFormWithFields: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getForm"),
                tags: TAGS,
            },
        })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ input, ctx }) => {
            const { formId } = input;
            
            let userId: string | undefined = undefined;
            const token = ctx.getCookie("token");
            if (token) {
                try {
                    const decoded = await userService.verifyAndDecodeUserToken(token);
                    userId = decoded.id;
                } catch (e) {
                    // Ignore token errors for public requests
                }
            }

            const form = await formService.getFormWithFields(formId, userId);
            return form;
        }),
    updateForm: authenticatedProcedure
        .meta({
            openapi: { method: "PUT", path: getPath("/updateForm"), tags: TAGS, protect: true }
        })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.updateForm({
                ...input,
                userId: ctx.user.id,
            });
            return result;
        }),
    deleteForm: authenticatedProcedure
        .meta({
            openapi: { method: "DELETE", path: getPath("/deleteForm"), tags: TAGS, protect: true }
        })
        .input(deleteFormInputModel)
        .output(deleteFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            const result = await formService.deleteForm({
                id: input.id,
                userId: ctx.user.id,
            });
            return result;
        }),
    getFormAnalytics: authenticatedProcedure
        .meta({
            openapi: { method: "GET", path: getPath("/getFormAnalytics"), tags: TAGS, protect: true }
        })
        .input(getFormAnalyticsInputModel)
        .output(getFormAnalyticsOutputModel)
        .query(async ({ input, ctx }) => {
            return formService.getFormAnalytics(input.formId, ctx.user.id);
        }),
    cloneForm: authenticatedProcedure
        .meta({
            openapi: { method: "POST", path: getPath("/cloneForm"), tags: TAGS, protect: true }
        })
        .input(cloneFormInputModel)
        .output(cloneFormOutputModel)
        .mutation(async ({ input, ctx }) => {
            return formService.cloneForm(input.id, ctx.user.id);
        }),
});
