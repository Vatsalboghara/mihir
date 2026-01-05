import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, IndianRupee, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import HeroSection from './HeroSection';

export default function DashboardContent() {
    const [analytics, setAnalytics] = useState({
        totalEarnings: 0,
        totalBookings: 0,
        upcomingBookings: 0
    });
    const [bookingData, setBookingData] = useState([]);
    const [timeSlotData, setTimeSlotData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420",
                };

                // Fetch Analytics
                const analyticsRes = await axios.get('https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/analytics', { headers });
                if (analyticsRes.data.success) {
                    setAnalytics(analyticsRes.data.data);
                }

                // Fetch Bookings for Chart
                const bookingsRes = await axios.get('https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/myturfbooking', { headers });
                if (bookingsRes.data.success) {
                    processBookingData(bookingsRes.data.bookings);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processBookingData = (bookings) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        const chartData = last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            // Assuming booking.date is in YYYY-MM-DD format based on previous file view
            // If it's different, we might need to adjust. Bookings.jsx uses booking.date directly.
            const count = bookings.filter(b => b.date === dateStr).length;
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
                bookings: count,
                fullDate: dateStr
            };
        });

        setBookingData(chartData);

        // Process Peak Hours Data
        const timeCounts = {};
        bookings.forEach(booking => {
            const time = booking.startTime; // Assuming "HH:mm" format
            if (time) {
                timeCounts[time] = (timeCounts[time] || 0) + 1;
            }
        });

        const sortedTimeData = Object.entries(timeCounts)
            .map(([time, count]) => ({ time, count }))
            .sort((a, b) => {
                // Sort by time (06:00 < 07:00)
                return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', ''));
            });

        setTimeSlotData(sortedTimeData);
    };

    const stats = [
        {
            title: 'Total Bookings',
            value: loading ? '...' : analytics.totalBookings.toString(),
            change: 'Lifetime bookings', // Updated label since we don't have comparison data yet
            trend: 'up',
            icon: Calendar,
            colorClass: 'bg-blue-500',
        },
        {
            title: 'Total Revenue',
            value: loading ? '...' : `₹${analytics.totalEarnings.toLocaleString()}`,
            change: 'Lifetime earnings',
            trend: 'up',
            icon: IndianRupee,
            colorClass: 'bg-green-500',
        },
        {
            title: 'Upcoming Bookings', // Replaced "Active Customers" with "Upcoming Bookings" as per API data
            value: loading ? '...' : analytics.upcomingBookings.toString(),
            change: 'Scheduled for future',
            trend: 'up',
            icon: Users,
            colorClass: 'bg-orange-500',
        }
        // Removed Slot Occupancy
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card-turf h-96 p-6 flex flex-col border border-border bg-card rounded-xl">
                        <h3 className="text-lg font-semibold mb-6">Weekly Booking Overview</h3>
                        <div className="flex-1 w-full min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bookingData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'var(--muted)' }}
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#000000' }}
                                            itemStyle={{ color: '#000000' }}
                                        />
                                        <Bar
                                            dataKey="bookings"
                                            fill="#22c55e"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    <div className="card-turf h-96 p-6 flex flex-col border border-border bg-card rounded-xl">
                        <h3 className="text-lg font-semibold mb-6">Peak Booking Hours</h3>
                        <div className="flex-1 w-full min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timeSlotData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                        />
                                        <YAxis
                                            dataKey="time"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={50}
                                            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'var(--muted)' }}
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#000000' }}
                                            itemStyle={{ color: '#000000' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#f97316" // Orange
                                            radius={[0, 4, 4, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
