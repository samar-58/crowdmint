import Link from "next/link";

export default function Navbar(){
    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Navigation Links */}
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Crowdmint
                        </Link>
                        <div className="hidden md:flex space-x-1">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                            >
                                Create Task
                            </Link>
                            <Link
                                href="/user/tasks"
                                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                            >
                                View Tasks
                            </Link>
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium">
                        Connect Wallet
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 bg-white">
                <div className="px-4 py-3 space-y-1">
                    <Link
                        href="/"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                    >
                        Create Task
                    </Link>
                    <Link
                        href="/user/tasks"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
                    >
                        View Tasks
                    </Link>
                </div>
            </div>
        </nav>
    );
}