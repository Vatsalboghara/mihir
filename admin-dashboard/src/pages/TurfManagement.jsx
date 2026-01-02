import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Clock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TurfManagement() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [boxId, setBoxId] = useState('');
    const [courts, setCourts] = useState([]);

    // Forms State
    const [generalInfo, setGeneralInfo] = useState({
        name: '',
        description: '',
        pricePerHour: ''
    });

    // Operating Hours State
    const [operatingHours, setOperatingHours] = useState({
        openTime: '06:00',
        closeTime: '23:00'
    });

    useEffect(() => {
        // Initial Load - Get boxId and Details from localStorage
        const storedBoxId = localStorage.getItem('boxId');
        const storedDetails = localStorage.getItem('boxDetails');

        if (storedBoxId) {
            setBoxId(storedBoxId);

            if (storedDetails) {
                try {
                    const details = JSON.parse(storedDetails);

                    // Pre-fill General Info
                    setGeneralInfo({
                        name: details.name || '',
                        description: details.description || '',
                        pricePerHour: details.pricePerHour || ''
                    });

                    // Pre-fill Courts
                    if (details.courts && Array.isArray(details.courts)) {
                        setCourts(details.courts);
                    }

                    // Pre-fill Operating Hours
                    // Checking for common structures (nested object or direct keys)
                    if (details.operatingHours) {
                        setOperatingHours({
                            openTime: details.operatingHours.openTime || '06:00',
                            closeTime: details.operatingHours.closeTime || '23:00'
                        });
                    }
                } catch (e) {
                    console.error("Error parsing stored box details", e);
                }
            }
        } else {
            toast.error("Turf ID not found. Please relogin or register.");
        }
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
    };

    const handleUpdateGeneral = async (e) => {
        e.preventDefault();
        if (!boxId) return toast.error("No Box ID found");
        setLoading(true);

        try {
            // MATCHING USER PAYLOAD: { name, description, pricePerHour }
            const payload = {
                name: generalInfo.name,
                description: generalInfo.description,
                pricePerHour: Number(generalInfo.pricePerHour)
            };
            console.log("Updating General Info Payload:", payload);

            const response = await axios.put(
                `https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/update-box-details/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update General Response:", response.data);
            toast.success("Turf details updated successfully");
        } catch (error) {
            console.error("Update General Error:", error);
            toast.error(error.response?.data?.message || "Failed to update details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourt = async (courtId, isAvailable) => {
        if (!boxId) return toast.error("No Box ID found");

        // Optimistic UI Update
        const previousCourts = [...courts];
        setCourts(courts.map(c =>
            c.courtNumber === courtId ? { ...c, isAvailable: isAvailable } : c
        ));

        try {
            // MATCHING USER PAYLOAD: { courtNumber, isAvailable }
            const payload = {
                courtNumber: Number(courtId),
                isAvailable: isAvailable
            };
            console.log("Updating Court Availability Payload:", payload);

            const response = await axios.put(
                `https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/update-court-availability/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update Court Response:", response.data);
            toast.success(`Court ${courtId} availability updated`);
        } catch (error) {
            console.error("Update Court Error:", error);
            toast.error("Failed to update court availability");
            // Revert state on error
            setCourts(previousCourts);
        }
    };

    const handleUpdateHours = async (e) => {
        e.preventDefault();
        if (!boxId) return toast.error("No Box ID found");
        setLoading(true);

        try {
            const payload = { ...operatingHours };
            console.log("Updating Hours Payload:", payload);

            const response = await axios.put(
                `https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/update-operating-hours/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update Hours Response:", response.data);
            toast.success("Operating hours updated");
        } catch (error) {
            console.error("Update Hours Error:", error);
            toast.error("Failed to update hours");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBox = async () => {
        if (!boxId) return;
        if (!window.confirm("Are you sure you want to delete this Turf? This action cannot be undone.")) return;

        setLoading(true);
        try {
            console.log("Deleting Box:", boxId);
            const response = await axios.delete(
                `https://nonsolidified-annika-criminally.ngrok-free.dev/api/admin/delete-box/${boxId}`,
                getAuthHeader()
            );
            console.log("Delete Response:", response.data);
            toast.success("Turf deleted successfully");

            // Cleanup and Redirect
            localStorage.removeItem('token');
            window.location.href = '/signup';
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Failed to delete turf");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Turf Management</h1>
                <p className="text-muted-foreground mt-2">Manage your venue details, courts, and policies.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border space-x-6">
                {['general', 'courts', 'hours', 'settings'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab === 'general' ? 'General Info' : tab === 'hours' ? 'Operating Hours' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

                {activeTab === 'general' && (
                    <form onSubmit={handleUpdateGeneral} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Turf Name</label>
                                <input
                                    type="text"
                                    value={generalInfo.name}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="Update Turf Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price Per Hour (₹)</label>
                                <input
                                    type="number"
                                    value={generalInfo.pricePerHour}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, pricePerHour: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="e.g. 1500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={generalInfo.description}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="Update Description"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button disabled={loading} type="submit" className="btn-primary flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'courts' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Manage Court Availability</h3>
                        </div>

                        {courts.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg">
                                <p>No courts found in your details.</p>
                                <p className="text-xs text-muted-foreground mt-1">Register again if you think this is a mistake.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courts.map((court, index) => (
                                    <div key={court._id || index} className="p-4 border border-border rounded-lg flex items-center justify-between bg-muted/5">
                                        <div>
                                            <p className="font-semibold">{court.courtName || `Court ${court.courtNumber}`}</p>
                                            <p className="text-xs text-muted-foreground">{court.surfaceType || 'Turf'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">Available?</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={court.isAvailable !== false} // Default to true if undefined
                                                    onChange={(e) => handleUpdateCourt(court.courtNumber, e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-4">* Toggling the switch immediately updates availability.</p>
                    </div>
                )}

                {activeTab === 'hours' && (
                    <form onSubmit={handleUpdateHours} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1"><Clock className="w-4 h-4 inline mr-1" /> Opening Time</label>
                                <input
                                    type="time"
                                    value={operatingHours.openTime}
                                    onChange={(e) => setOperatingHours({ ...operatingHours, openTime: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1"><Clock className="w-4 h-4 inline mr-1" /> Closing Time</label>
                                <input
                                    type="time"
                                    value={operatingHours.closeTime}
                                    onChange={(e) => setOperatingHours({ ...operatingHours, closeTime: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button disabled={loading} type="submit" className="btn-primary flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" /> Update Hours
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                            <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-4">
                                Deleting your turf will remove all associated data, including bookings, revenue history, and court details. This action is permanent.
                            </p>
                            <button
                                onClick={handleDeleteBox}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete Turf
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
