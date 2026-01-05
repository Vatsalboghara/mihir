import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Calendar, Users, BarChart3, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'Turf Management', icon: Database, path: '/turf-management' },
        { name: 'Bookings', icon: Calendar, path: '/bookings' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    ];

    const bottomItems = [
        { name: 'Settings', icon: Settings, path: '/settings' },
        { name: 'Support', icon: HelpCircle, path: '/support' },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname === path;
    };

    return (
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight">TurfManager</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border space-y-1">
                {bottomItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                ))}
            </div>
        </aside>
    );
}
