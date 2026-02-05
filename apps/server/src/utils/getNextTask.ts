import { prisma } from './constants.js';

export async function getNextTask(workerId: string) {
    const task = await prisma.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    workerId: workerId,
                },
            },
        },
        select: {
            title: true,
            options: true,
            id: true,
            amount: true,
            maximumSubmissions: true,
        }
    });
    return task;
}
