import { useState, useMemo } from 'react';
import { X, Search, AlertTriangle, Calendar, Clock, CheckCircle, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useTurf } from '../context/TurfContext';
import { API_BASE_URL, BOOKING_API_URL, getAuthHeaders } from '../config/api';

export default function OfflineBookingDrawer({ isOpen, onClose }) {
    const { turfDetails, bookings, refreshData } = useTurf();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Select & Check, 2: Guest Details & Confirm

    // Form State
    const [bookingData, setBookingData] = useState({
        mobile: '',
        userName: '',
        selectedCourtId: '',
        date: new Date().toISOString().split('T')[0],
        timeSlots: [],
        paymentStatus: 'pending', // pending, paid
        paymentMethod: 'cash' // cash, upi
    });

    // Mock Data for "No-Show" Warning
    const [userWarning, setUserWarning] = useState(null);

    // Generate Time Slots (06:00 to 23:00)
    const allTimeSlots = useMemo(() => {
        const slots = [];
        for (let i = 6; i < 23; i++) {
            const start = i.toString().padStart(2, '0') + ':00';
            const end = (i + 1).toString().padStart(2, '0') + ':00';
            slots.push({
                id: `${start}-${end}`,
                startTime: start,
                endTime: end,
                label: `${start} - ${end}`
            });
        }
        return slots;
    }, []);

    // Derived: Check availability based on existing bookings (Visual feedback only)
    const slotStatusMap = useMemo(() => {
        if (!bookingData.date || !bookingData.selectedCourtId) return {};

        const statusMap = {};

        // Filter bookings for selected date and court
        const relevantBookings = bookings.filter(b =>
            b.date === bookingData.date &&
            (b.courtId === bookingData.selectedCourtId || b.courtDetails?._id === bookingData.selectedCourtId) &&
            b.bookingStatus !== 'cancelled'
        );

        allTimeSlots.forEach(slot => {
            // Check if this slot overlaps with any confirmed booking
            const isBooked = relevantBookings.some(b => {
                // Standard overlap check: (start1 < end2) && (start2 < end1)
                return slot.startTime < b.endTime && b.startTime < slot.endTime;
            });
            statusMap[slot.id] = isBooked ? 'booked' : 'available';
        });

        return statusMap;
    }, [bookings, bookingData.date, bookingData.selectedCourtId, allTimeSlots]);



    // ... (render) ...



    // Simulate User Search with Warning Logic
    const handleMobileSearch = (e) => {
        const mobile = e.target.value;
        setBookingData(prev => ({ ...prev, mobile }));

        // Check recent bookings for No-Shows
        const pastNoShows = bookings.filter(b =>
            (b.userPhone === mobile || b.phone === mobile) &&
            b.paymentStatus === 'pending' &&
            new Date(b.date) < new Date()
        ).length;

        if (mobile.length === 10) {
            if (pastNoShows > 0) {
                setUserWarning({ type: 'danger', message: `⚠️ Warning: This user has ${pastNoShows} recorded pending payments/no-shows.` });
            } else if (mobile === '9876543210') {
                setUserWarning({ type: 'danger', message: '⚠️ Warning: This user has 2 recorded No-Shows.' });
            } else {
                setUserWarning(null);
            }
        } else {
            setUserWarning(null);
        }
    };

    const toggleTimeSlot = (slot) => {
        if (slotStatusMap[slot.id] === 'booked') return;

        const isSelected = bookingData.timeSlots.find(s => s.id === slot.id);
        if (isSelected) {
            setBookingData(prev => ({ ...prev, timeSlots: prev.timeSlots.filter(s => s.id !== slot.id) }));
        } else {
            setBookingData(prev => ({ ...prev, timeSlots: [...prev.timeSlots, slot] }));
        }
    };

    const calculateTotal = () => {
        const price = Number(turfDetails?.pricePerHour || 0);
        return bookingData.timeSlots.length * price;
    };

    // STEP 1 Action: Check Availability
    const checkAvailability = async () => {
        if (!bookingData.selectedCourtId || bookingData.timeSlots.length === 0) {
            toast.error("Please select a court and at least one time slot");
            return;
        }

        setLoading(true);
        try {
            const boxId = turfDetails?._id || localStorage.getItem('boxId');

            // Sort time slots
            const sortedSlots = [...bookingData.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
            const startTime = sortedSlots[0].startTime;
            const endTime = sortedSlots[sortedSlots.length - 1].endTime;

            const payload = {
                date: bookingData.date,
                startTimes: startTime,  // API uses plural 'startTimes' per request description
                endTimes: endTime,      // API uses plural 'endTimes' per request description
                courtId: bookingData.selectedCourtId
            };

            console.log("Checking availability with payload:", payload);

            // API CALL
            await axios.post(
                `${BOOKING_API_URL}/is-available/${boxId}`,
                payload,
                getAuthHeaders()
            );

            // If successful (no 400/500 error), proceed
            setStep(2);
            toast.success("Slot is available! Proceeding...");

        } catch (error) {
            console.error("Availability Check Error:", error);
            const msg = error.response?.data?.message || "Selected slot is NOT available.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // STEP 2 Action: Create Booking
    const handleConfirmBooking = async () => {
        if (!bookingData.mobile || !bookingData.userName) {
            toast.error("Please fill all guest details");
            return;
        }

        setLoading(true);
        try {
            const boxId = turfDetails?._id || localStorage.getItem('boxId');

            // Sort time slots
            const sortedSlots = [...bookingData.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
            const startTime = sortedSlots[0].startTime;
            const endTime = sortedSlots[sortedSlots.length - 1].endTime;

            const payload = {
                boxId: boxId,
                courtId: bookingData.selectedCourtId,
                date: bookingData.date,
                startTime: startTime,
                endTime: endTime,
                guestDetails: {
                    name: bookingData.userName,
                    phone: bookingData.mobile
                },
                paymentStatus: bookingData.paymentStatus,
                paymentMethod: bookingData.paymentStatus === 'success' ? bookingData.paymentMethod : null
            };

            console.log("Creating booking with payload:", payload);

            await axios.post(
                `${BOOKING_API_URL}/create-offline-booking`,
                payload,
                getAuthHeaders()
            );

            toast.success("Offline Booking Confirmed!");
            refreshData(); // Refresh bookings list
            handleClose(); // Fully close and reset

        } catch (error) {
            console.error("Booking Error:", error);
            const msg = error.response?.data?.message || "Failed to create booking";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Delay reset to avoid UI flicker while closing
        setTimeout(() => {
            setStep(1);
            setBookingData({
                mobile: '',
                userName: '',
                selectedCourtId: '',
                date: new Date().toISOString().split('T')[0],
                timeSlots: [],
                paymentStatus: 'pending',
                paymentMethod: 'cash'
            });
            setUserWarning(null);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-slide-in-right">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">New Offline Booking</h2>
                        <span className="text-xs text-muted-foreground">Step {step} of 2</span>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* STEP 1: SELECT & VERIFY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                            {/* Turf Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Select Turf</label>
                                <select
                                    value={bookingData.selectedCourtId}
                                    onChange={(e) => {
                                        console.log("Selected Court ID:", e.target.value);
                                        setBookingData(prev => ({ ...prev, selectedCourtId: e.target.value, timeSlots: [] }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none"
                                >
                                    <option value="">Select a Court</option>
                                    {turfDetails?.courts?.map((court, idx) => (
                                        <option key={court._id || idx} value={court._id || court.courtNumber}>
                                            {court.courtName || `Court ${court.courtNumber}`} - {court.surfaceType || 'Turf'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={bookingData.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value, timeSlots: [] }))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Select Time Slots {bookingData.selectedCourtId ? '' : '(Select Court first)'}</label>
                                <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {allTimeSlots.map((slot) => {
                                        const isSelected = bookingData.timeSlots.find(s => s.id === slot.id);
                                        const status = slotStatusMap[slot.id] || 'available';
                                        const isBooked = status === 'booked';

                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isBooked || !bookingData.selectedCourtId}
                                                onClick={() => toggleTimeSlot(slot)}
                                                className={`
                                                    px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2
                                                    ${isBooked
                                                        ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-60'
                                                        : isSelected
                                                            ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                                            : 'bg-card text-foreground border-border hover:border-green-500/50 hover:bg-green-50/50'
                                                    }
                                                `}
                                            >
                                                <Clock className="w-3 h-3" />
                                                {slot.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2 px-1">
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span> Selected</div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-border bg-card"></span> Available</div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted"></span> Booked (Visual)</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: GUEST & PAYMENT */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">

                            {/* Summary Card */}
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl space-y-2">
                                <h4 className="text-sm font-semibold text-green-800 mb-2">Booking Summary</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{bookingData.date}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    {/* Calculated derived time range display */}
                                    <span className="font-medium">
                                        {bookingData.timeSlots.length > 0 ? (() => {
                                            const sorted = [...bookingData.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
                                            return `${sorted[0].startTime} - ${sorted[sorted.length - 1].endTime}`;
                                        })() : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-bold text-green-700">₹{calculateTotal()}</span>
                                </div>
                            </div>

                            {/* 1. Customer Search */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Customer Search (Mobile)</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        placeholder="Enter Mobile Number"
                                        value={bookingData.mobile}
                                        onChange={handleMobileSearch}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-2 transition-all ${userWarning ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:border-green-500 focus:ring-green-500/20'
                                            }`}
                                        maxLength={10}
                                    />
                                </div>

                                {/* Warning Alert */}
                                {userWarning && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <p className="font-medium">{userWarning.message}</p>
                                    </div>
                                )}
                            </div>

                            {/* 2. Customer Name */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">Guest Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        value={bookingData.userName}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, userName: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* 5. Payment Section */}
                            <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center pb-3 border-b border-border border-dashed">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <span className="text-lg font-bold text-foreground">₹{calculateTotal()}</span>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Status</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`
                                            cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                            ${bookingData.paymentStatus === 'pending'
                                                ? 'bg-orange-500/10 border-orange-500/50 text-orange-700'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="paymentStatus"
                                                className="hidden"
                                                checked={bookingData.paymentStatus === 'pending'}
                                                onChange={() => setBookingData(prev => ({ ...prev, paymentStatus: 'pending' }))}
                                            />
                                            Pending
                                        </label>
                                        <label className={`
                                            cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                            ${bookingData.paymentStatus === 'success'
                                                ? 'bg-green-500/10 border-green-500/50 text-green-700'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                            }
                                        `}>
                                            <input
                                                type="radio"
                                                name="paymentStatus"
                                                className="hidden"
                                                checked={bookingData.paymentStatus === 'success'}
                                                onChange={() => setBookingData(prev => ({ ...prev, paymentStatus: 'success' }))}
                                            />
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Completed
                                        </label>
                                    </div>
                                </div>

                                {bookingData.paymentStatus === 'success' && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Method</span>
                                        <div className="flex gap-2">
                                            {['Cash', 'UPI', 'Card'].map((method) => (
                                                <button
                                                    key={method}
                                                    onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: method.toLowerCase() }))}
                                                    className={`
                                                        flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                        ${bookingData.paymentMethod === method.toLowerCase()
                                                            ? 'bg-foreground text-background border-foreground'
                                                            : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                        }
                                                    `}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/5 space-y-3">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={checkAvailability}
                                disabled={bookingData.timeSlots.length === 0 || loading || !bookingData.selectedCourtId}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Checking Availability...' : 'Proceed to Payment'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-3 bg-card border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={loading}
                                className="w-2/3 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
