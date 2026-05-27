import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formFieldService } from "../../services";

import {
    createFieldInputModel,
    createFieldOutputModel,
    getFieldsInputModel,
    getFieldsOutputModel,
    updateFieldInputModel,
    updateFieldOutputModel,
    deleteFieldInputModel,
    deleteFieldOutputModel,
} from "./model";

const TAGS = ["FormField"];
const getPath = generatePath("/form-field");

export const formFieldRouter = router({
    createField: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFieldInputModel)
        .output(createFieldOutputModel)
        .mutation(async ({ input }) => {
            const { label, type, formId, description, placeholder, isRequired, options } = input;

            const result = await formFieldService.createField({
                label,
                type,
                formId,
                description,
                placeholder,
                isRequired,
                options,
            });

            return result;
        }),

    getFields: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFields"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getFieldsInputModel)
        .output(getFieldsOutputModel)
        .query(async ({ input }) => {
            const { formId } = input;
            const result = await formFieldService.getFields(formId);
            return result;
        }),
    updateField: authenticatedProcedure
        .meta({
            openapi: { method: "PUT", path: getPath("/updateField"), tags: TAGS, protect: true }
        })
        .input(updateFieldInputModel)
        .output(updateFieldOutputModel)
        .mutation(async ({ input }) => {
            const result = await formFieldService.updateField(input);
            return result;
        }),
    deleteField: authenticatedProcedure
        .meta({
            openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true }
        })
        .input(deleteFieldInputModel)
        .output(deleteFieldOutputModel)
        .mutation(async ({ input }) => {
            const result = await formFieldService.deleteField(input);
            return result;
        }),
});
