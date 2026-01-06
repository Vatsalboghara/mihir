import { useState, useEffect } from 'react';
import { useTurf } from '../context/TurfContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Clock, Activity, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Analytics() {
    const { analytics, processedCharts, loading } = useTurf();
    const { weeklyData: bookingData, timeSlotData } = processedCharts;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground mt-2">Deep dive into your turf's performance</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-2">₹{analytics.totalEarnings.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                            <h3 className="text-2xl font-bold mt-2">{analytics.totalBookings}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                            <h3 className="text-2xl font-bold mt-2">{analytics.upcomingBookings}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <Clock className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Weekly Trends */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Weekly Booking Trends
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={bookingData}>
                                    <defs>
                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
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
                                        cursor={{ stroke: 'var(--muted)' }}
                                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#000000' }}
                                        itemStyle={{ color: '#000000' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="#22c55e"
                                        fillOpacity={1}
                                        fill="url(#colorBookings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Peak Hours Analysis
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
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
                                        fill="#f97316"
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
    );
}
