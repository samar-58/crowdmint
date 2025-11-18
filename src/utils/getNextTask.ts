import { prisma } from "./constants";

export async function getNextTask(workerId:string){
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
        maximumSubmissions:true,
    }
})
return task;
}