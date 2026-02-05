import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/constants";

export async function GET(req: NextRequest) {
    const workerId = req.headers.get("x-worker-id");

    if (!workerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const worker = await prisma.worker.findUnique({
            where: {
                id: workerId
            },
            include: {
                submissions: {
                    take: 50,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        task: {
                            select: {
                                title: true
                            }
                        }
                    }
                },
                payouts: {
                    take: 50,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!worker) {
            return NextResponse.json({ error: "Worker not found" }, { status: 404 });
        }

        const totalEarned = worker.submissions.reduce((acc, sub) => acc + sub.amount, 0);

        // Count total completed tasks
        const totalTasks = await prisma.submission.count({
            where: {
                workerId: workerId
            }
        });

        return NextResponse.json({
            summary: {
                totalEarned,
                pendingBalance: worker.pendingBalance,
                lockedBalance: worker.lockedBalance,
                totalTasks
            },
            submissions: worker.submissions.map(sub => ({
                id: sub.id,
                taskTitle: sub.task?.title || "Unknown Task",
                amount: sub.amount,
                createdAt: sub.createdAt
            })),
            payouts: worker.payouts.map(payout => ({
                id: payout.id,
                amount: payout.amount,
                status: payout.status,
                signature: payout.signature,
                createdAt: payout.createdAt
            }))
        });

    } catch (error) {
        console.error("Error fetching earnings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
