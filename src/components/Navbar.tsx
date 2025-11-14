import Link from "next/link";

export default function Navbar(){
    return <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Crowdmint
            </Link>
            <nav className="flex space-x-6">
                <Link
                    href="/"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                    Create Task
                </Link>
                <Link
                    href="/user/tasks"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                    View Tasks
                </Link>
            </nav>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Connect your wallet
        </button>
    </div>
}