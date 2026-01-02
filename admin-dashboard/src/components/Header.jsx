import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState('John Doe');
    const [userEmail, setUserEmail] = useState('admin@turfmanager.com');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const dropdownRef = useRef(null);

    // Load username and email from storage
    const loadUserData = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
        }
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setUserEmail(storedEmail);
        }
    };

    useEffect(() => {
        loadUserData();

        // Listen for storage events (e.g. from Signup page updates)
        const handleStorageChange = () => loadUserData();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search bookings, customers..."
                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-lg text-sm transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isLoggedIn ? (
                    <>
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-border mx-1"></div>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-secondary transition-colors border border-transparent hover:border-border cursor-pointer outline-none"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-medium leading-none">{userName}</p>
                                    <p className="text-xs text-muted-foreground">Manager</p>
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-border mb-1 bg-muted/50">
                                        <p className="text-sm font-medium">{userName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                    </div>

                                    <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        Profile
                                    </a>
                                    {/* <Link to="/signup" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                                        Start Booking
                                    </Link> */}
                                    <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                        Settings
                                    </a>

                                    <div className="border-t border-border mt-1 my-1"></div>

                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('userName');
                                            localStorage.removeItem('userEmail');
                                            localStorage.removeItem('boxId');
                                            localStorage.removeItem('boxDetails');
                                            window.location.href = '/signup';
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg text-sm transition-colors shadow-sm"
                        >
                            Start Booking
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
