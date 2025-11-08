import z from "zod";

export const submissionSchema = z.object({
    taskId: z.string(),
    optionId: z.string(),
})