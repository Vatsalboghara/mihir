import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import { processBookingChartsData } from '../utils/analyticsUtils';

const TurfContext = createContext();

export const useTurf = () => {
    const context = useContext(TurfContext);
    if (!context) {
        throw new Error('useTurf must be used within a TurfProvider');
    }
    return context;
};

export const TurfProvider = ({ children }) => {
    const [analytics, setAnalytics] = useState({
        totalEarnings: 0,
        totalBookings: 0,
        upcomingBookings: 0
    });
    const [bookings, setBookings] = useState([]);
    const [processedCharts, setProcessedCharts] = useState({ weeklyData: [], timeSlotData: [] });
    const [loading, setLoading] = useState(true);
    const [turfDetails, setTurfDetails] = useState(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const config = getAuthHeaders();

            // Fetch Analytics & Bookings concurrently
            const [analyticsRes, bookingsRes, turfRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/analytics`, config),
                axios.get(`${API_BASE_URL}/myturfbooking`, config),
                axios.get(`${API_BASE_URL}/turf`, config)
            ]);

            // Handle Analytics
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
                setAnalytics(analyticsRes.value.data.data);
            }

            // Handle Bookings
            if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data.success) {
                const bookingList = bookingsRes.value.data.bookings;
                setBookings(bookingList);
                setProcessedCharts(processBookingChartsData(bookingList));
            }

            // Handle Turf Details
            if (turfRes.status === 'fulfilled' && turfRes.value.data.data?.length > 0) {
                setTurfDetails(turfRes.value.data.data[0]);
                localStorage.setItem('boxDetails', JSON.stringify(turfRes.value.data.data[0]));
                localStorage.setItem('boxId', turfRes.value.data.turfId || turfRes.value.data.data[0]._id);
            }

        } catch (error) {
            console.error("Error refreshing turf data:", error);
            toast.error("Failed to refresh data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const value = {
        analytics,
        bookings,
        processedCharts,
        turfDetails,
        loading,
        refreshData,
        updateTurfDetails: setTurfDetails // Allow manual update to bypass stale fetch
    };

    return (
        <TurfContext.Provider value={value}>
            {children}
        </TurfContext.Provider>
    );
};
