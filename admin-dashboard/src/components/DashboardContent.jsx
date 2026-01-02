import { Users, Calendar, IndianRupee, Activity } from 'lucide-react';
import StatCard from './StatCard';
import HeroSection from './HeroSection';

export default function DashboardContent() {
    const stats = [
        {
            title: 'Total Bookings',
            value: '142',
            change: '+12% from last month',
            trend: 'up',
            icon: Calendar,
            colorClass: 'bg-blue-500',
        },
        {
            title: 'Total Revenue',
            value: '₹84,200',
            change: '+8.2% from last month',
            trend: 'up',
            icon: IndianRupee,
            colorClass: 'bg-green-500',
        },
        {
            title: 'Active Customers',
            value: '2,300',
            change: '+4.3% from last month',
            trend: 'up',
            icon: Users,
            colorClass: 'bg-orange-500',
        },
        {
            title: 'Slot Occupancy',
            value: '84%',
            change: '-2% from last week',
            trend: 'down',
            icon: Activity,
            colorClass: 'bg-purple-500',
        },
    ];

    return (
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, here's what's happening at your turf today.
                    </p>
                </div>

                <HeroSection />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Placeholder for future charts/tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card-turf h-96 p-6 flex flex-col items-center justify-center text-muted-foreground border-dashed">
                        <span className="bg-secondary p-4 rounded-full mb-4">
                            <Activity className="w-8 h-8 opacity-50" />
                        </span>
                        <p>Booking Analytics Chart (Coming Soon)</p>
                    </div>
                    <div className="card-turf h-96 p-6 flex flex-col items-center justify-center text-muted-foreground border-dashed">
                        <span className="bg-secondary p-4 rounded-full mb-4">
                            <Calendar className="w-8 h-8 opacity-50" />
                        </span>
                        <p>Upcoming Bookings (Coming Soon)</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
