import { prisma } from "./constants";

export async function getNextTask(workerId:string,taskId?:string){
let whereClause = {
    done:false,
    submissions:{
        none:{
            workerId:workerId,
        },
    },
}


    if(taskId){
        return await prisma.task.findUnique({
            where:{
                id:taskId,
            },
        })
    }
    let task = await prisma.task.findFirst({
    where:{
        done:false,
     submissions:{
    none:{
        workerId:workerId,
    },
},
    },
    select:{
        title:true,
        options:true,
        id:true,
        amount:true,
    }
})
return task;
}