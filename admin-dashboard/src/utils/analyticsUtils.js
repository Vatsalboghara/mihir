export const processBookingChartsData = (bookings) => {
    // 1. Weekly Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const weeklyData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const count = bookings.filter(b => b.date === dateStr).length;
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            bookings: count,
            fullDate: dateStr
        };
    });

    // 2. Peak Hours Data
    const timeCounts = {};
    bookings.forEach(booking => {
        const time = booking.startTime;
        if (time) {
            timeCounts[time] = (timeCounts[time] || 0) + 1;
        }
    });

    const sortedTimeData = Object.entries(timeCounts)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => {
            return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', ''));
        });

    return {
        weeklyData,
        timeSlotData: sortedTimeData
    };
};
