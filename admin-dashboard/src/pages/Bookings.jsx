import { useState } from 'react';
import { useTurf } from '../context/TurfContext';
import { Calendar, Search, Filter, Download, Eye, MoreHorizontal, Loader2, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import OfflineBookingDrawer from '../components/OfflineBookingDrawer';

export default function Bookings() {
    const { bookings, loading, refreshData: fetchBookings } = useTurf();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleExport = () => {
        if (filteredBookings.length === 0) {
            toast.error("No data to export");
            return;
        }

        // Define CSV headers
        const headers = ["Order ID", "Date", "Time", "Duration", "Total Amount", "Status", "Payment Status", "Court Name", "Surface Type", "User ID"];

        // Map data to rows
        const rows = filteredBookings.map(b => [
            b.orderId || '',
            b.date || '',
            `${b.startTime} - ${b.endTime}`,
            b.duration || '',
            b.totalAmount || '',
            b.bookingStatus || '',
            b.paymentStatus || '',
            b.courtDetails?.courtName || '',
            b.courtDetails?.surfaceType || '',
            b.user || ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-500';
            case 'pending': return 'text-yellow-500';
            case 'failed': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filterStatus === 'all' || booking.bookingStatus === filterStatus;
        const matchesSearch =
            booking.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking._id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
                    <p className="text-muted-foreground mt-2">Manage and view all your turf bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={fetchBookings} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                        Refresh
                    </button>
                </div>
            </div>

            <OfflineBookingDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, User ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'completed', 'pending', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${filterStatus === status
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Booking Details</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Date & Time</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Court Info</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Amount</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            <span className="text-sm">Loading bookings...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-muted/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{booking.orderId || 'N/A'}</span>
                                                <span className="text-xs text-muted-foreground font-mono mt-0.5">{booking._id?.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-foreground font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {booking.date}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{booking.courtDetails?.courtName || 'Unknown Court'}</span>
                                                <span className="text-xs text-muted-foreground">{booking.courtDetails?.surfaceType || 'Unknown Surface'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">
                                                ₹{booking.totalAmount}
                                            </div>
                                            <div className={`text-xs flex items-center gap-1 mt-0.5 font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                <span className="capitalize">{booking.paymentStatus}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.bookingStatus)} capitalize`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static Placeholder for now) */}
                {!loading && filteredBookings.length > 0 && (
                    <div className="bg-muted/10 border-t border-border px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Showing {filteredBookings.length} bookings</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-background border border-border rounded hover:bg-muted transition-colors disabled:opacity-50">Previous</button>
                            <button className="px-3 py-1 bg-background border border-border rounded hover:bg-muted transition-colors disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Order ID</p>
                                    <p className="font-semibold">{selectedBooking.orderId}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Booking Status</p>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.bookingStatus)} capitalize`}>
                                        {selectedBooking.bookingStatus}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Date & Time</p>
                                    <p className="font-medium">{selectedBooking.date}</p>
                                    <p className="text-sm">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-semibold text-lg">₹{selectedBooking.totalAmount}</p>
                                    <p className={`text-sm ${getPaymentStatusColor(selectedBooking.paymentStatus)} capitalize`}>
                                        Payment: {selectedBooking.paymentStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Group Members</h3>
                                {selectedBooking.groupMembers && selectedBooking.groupMembers.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedBooking.groupMembers.map((member, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
                                                <span className="text-sm font-mono">{member.memberId?.slice(0, 10)}...</span>
                                                <span className={`text-xs px-2 py-1 rounded capitalize ${member.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {member.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No group members added.</p>
                                )}
                            </div>

                            <div className="bg-muted/20 p-4 rounded-lg space-y-2 text-xs font-mono text-muted-foreground">
                                <p>Backend ID: {selectedBooking._id}</p>
                                <p>User ID: {selectedBooking.user}</p>
                                <p>Created At: {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                            </div>

                        </div>
                        <div className="p-6 border-t border-border bg-muted/10 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 border border-border bg-background hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
