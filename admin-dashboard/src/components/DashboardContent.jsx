import { useState, useEffect } from 'react';
import { useTurf } from '../context/TurfContext';
import { Users, Calendar, IndianRupee, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import HeroSection from './HeroSection';

export default function DashboardContent() {
    const { analytics, processedCharts, loading, bookings } = useTurf();
    const { weeklyData, timeSlotData } = processedCharts;

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
                                    <BarChart data={weeklyData}>
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
