import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return {
        createFormAsync,
        createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};

export const useUpdateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: updateFormAsync,
        mutate: updateForm,
        error,
        status,
        isPending,
    } = trpc.form.updateForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return { updateFormAsync, updateForm, error, status, isPending };
};

export const useDeleteForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFormAsync,
        mutate: deleteForm,
        error,
        status,
        isPending,
    } = trpc.form.deleteForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return { deleteFormAsync, deleteForm, error, status, isPending };
};

export const useListForms = () => {
    const {
        data: forms,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.listForms.useQuery();

    return {
        forms,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};

export const useGetFormWithFields = (formId: string) => {
    const {
        data: form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getFormWithFields.useQuery({ formId }, { enabled: !!formId });

    return {
        form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};

export const useGetFormAnalytics = (formId: string) => {
    const {
        data: analytics,
        error,
        isLoading,
    } = trpc.form.getFormAnalytics.useQuery({ formId }, { enabled: !!formId });
    return { analytics, error, isLoading };
};

export const useCloneForm = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: cloneFormAsync,
        status,
        isPending,
    } = trpc.form.cloneForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });
    return { cloneFormAsync, status, isPending };
};

export const useListPublicForms = () => {
    const { data: forms, isLoading } = trpc.form.listPublicForms.useQuery();
    return { forms, isLoading };
};
