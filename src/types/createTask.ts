import z from "zod";

export const createTaskSchema =  z.object({
options: z.array(z.object({
    imageUrl: z.string(),
})),
title: z.string().optional(),
type: z.enum(["TEXT", "IMAGE"]),
signature: z.string(),
})