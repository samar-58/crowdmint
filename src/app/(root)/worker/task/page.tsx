import Navbar from "@/components/common/Navbar";
import NextTask from "@/components/worker/NextTask";

export default function TaskPage(){
    return (
        <>
            <div className="min-h-screen bg-gray-50 ">
            <Navbar role="worker" />
                <NextTask />
            </div>
        </>
    )
}