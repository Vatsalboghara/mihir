export default function HeroSection() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 mt-8 mb-10 border border-blue-100">
            <div className="relative z-10 px-8 py-12 md:py-16 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Live Dashboard
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                        Manage your Turf <br />
                        <span className="text-blue-600">Like a Pro!</span>
                    </h2>

                    <p className="text-slate-600 text-lg md:text-xl max-w-xl mx-auto md:mx-0">
                        Streamline bookings, track revenue, and grow your sports business with our all-in-one management solution.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                            Start Booking
                        </button>
                        <button className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-lg px-8 py-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95">
                            View Reports
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative w-full max-w-lg">
                    {/* Abstract visual representation of dashboard elements floating */}
                    <div className="relative z-10 grid gap-4 p-4">
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">₹</div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Daily Revenue</p>
                                    <p className="text-lg font-bold text-slate-800">₹12,450</p>
                                </div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[70%]"></div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 transform translate-x-8 -translate-y-4 hover:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <p className="text-sm font-medium text-slate-700">Slot 18:00 - 19:00 Booked</p>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-sm font-medium text-slate-700">Slot 19:00 - 20:00 Available</p>
                            </div>
                        </div>
                    </div>

                    {/* Graphic elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
            </div>
        </div>
    );
}
