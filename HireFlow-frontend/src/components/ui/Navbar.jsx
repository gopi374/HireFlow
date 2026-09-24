import '../../index.css'

const Navbar = () => {
    return (
        <nav className="bg-blue-200 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        className="w-10 h-10 rounded-xl object-cover"
                        src="/logo.png"
                        alt="HireFlow Logo"
                    />
                    <h1 className="text-xl font-bold text-gray-900">HireFlow</h1>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                    <a href="#hero" className="hover:text-blue-700 transition">About</a>
                    <a href="#working" className="hover:text-blue-700 transition">Working</a>
                    <a href="#services" className="hover:text-blue-700 transition">Services</a>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-gray-800 rounded-lg hover:bg-blue-300 transition"
                    >
                        Login
                    </a>
                    <a
                        href="/signup"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-green-800 transition"
                    >
                        Signup
                    </a>
                </div>
            </div>
        </nav>
    )
}

export default Navbar