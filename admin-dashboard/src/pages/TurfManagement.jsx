import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTurf } from '../context/TurfContext';
import { Save, Clock, Trash2, AlertTriangle, Loader2, Plus, X, Phone, MapPin, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';

export default function TurfManagement() {
    const { turfDetails, refreshData, updateTurfDetails } = useTurf();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [boxId, setBoxId] = useState('');
    const [courts, setCourts] = useState([]);

    // Forms State
    const [generalInfo, setGeneralInfo] = useState({
        name: '',
        description: '',
        pricePerHour: '',
        phoneNumber: '',
        location: '',
        images: [],
        amenities: []
    });
    const [newImage, setNewImage] = useState('');
    const [newAmenity, setNewAmenity] = useState('');

    // Operating Hours State
    // Operating Hours State
    const [operatingHours, setOperatingHours] = useState({
        monday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        tuesday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        wednesday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        thursday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        friday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        saturday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
        sunday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
    });


    const updateStateFromDetails = (details) => {
        try {
            console.log("Updating State from Details:", details);
            // Pre-fill General Info
            setGeneralInfo({
                name: details.name || '',
                description: details.description || '',
                pricePerHour: details.pricePerHour || '',
                phoneNumber: details.phoneno || '',
                location: details.address?.fullAddress || details.location || '',
                images: details.images || [],
                amenities: details.amenities || []
            });

            // Pre-fill Courts
            if (details.courts && Array.isArray(details.courts)) {
                setCourts(details.courts);
            }

            // Pre-fill Operating Hours
            if (details.operatingHours) {
                // Default structure to ensure clean state updates
                const defaultHours = {
                    monday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    tuesday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    wednesday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    thursday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    friday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    saturday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                    sunday: { openTime: '06:00', closeTime: '23:00', isClosed: false },
                };

                const newHours = JSON.parse(JSON.stringify(defaultHours)); // Deep copy

                Object.keys(newHours).forEach(day => {
                    // Try exact match or capitalized match to be safe
                    const backendData = details.operatingHours[day] || details.operatingHours[day.charAt(0).toUpperCase() + day.slice(1)];

                    if (backendData) {
                        const openTime = backendData.open || backendData.openTime || '06:00';
                        const closeTime = backendData.close || backendData.closeTime || '23:00';
                        // Handle isClosed specifically as it might be boolean or string in some legacy dbs
                        const isClosed = backendData.isClosed === true || backendData.isClosed === 'true';

                        newHours[day] = {
                            openTime,
                            closeTime,
                            isClosed
                        };
                    }
                });
                setOperatingHours(newHours);
            }
        } catch (e) {
            console.error("Error updating state from details", e);
        }
    };

    // Sync state with turfDetails from Context
    useEffect(() => {
        if (turfDetails) {
            setBoxId(turfDetails._id || localStorage.getItem('boxId'));
            updateStateFromDetails(turfDetails);
        } else {
            // Fallback to localStorage if context is empty (e.g. reload)
            const storedBoxId = localStorage.getItem('boxId');
            const storedDetails = localStorage.getItem('boxDetails');

            if (storedBoxId) setBoxId(storedBoxId);
            if (storedDetails) {
                try {
                    updateStateFromDetails(JSON.parse(storedDetails));
                } catch (e) {
                    console.error("Error parsing stored details", e);
                }
            }
        }
    }, [turfDetails]);

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
            // MATCHING USER PAYLOAD
            const payload = {
                name: generalInfo.name,
                description: generalInfo.description,
                pricePerHour: generalInfo.pricePerHour,
                phoneno: generalInfo.phoneNumber,
                location: generalInfo.location, // Assuming backend accepts this for address update
                images: generalInfo.images,
                amenities: generalInfo.amenities
            };
            console.log("Updating General Info Payload:", payload);
            console.log("miludon...", payload.pricePerHour);


            const response = await axios.put(
                `${API_BASE_URL}/update-box-details/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update General Response:", response.data);

            // UPDATE LOCAL STORAGE AND STATE
            const updatedBox = response.data.box || response.data.data; // Adjust based on actual API response
            if (updatedBox) {
                localStorage.setItem('boxDetails', JSON.stringify(updatedBox));
                console.log("Updated localStorage with new box details:", updatedBox);
                // Also update other state if needed, though generalInfo is already controlled
            }

            toast.success("Turf details updated successfully");
        } catch (error) {
            console.error("Update General Error:", error);
            console.error("Error Response Data:", error.response?.data);
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
                `${API_BASE_URL}/update-court-availability/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update Court Response:", response.data);

            // UPDATE LOCAL STORAGE
            const updatedBox = response.data.box || response.data.data;
            if (updatedBox) {
                localStorage.setItem('boxDetails', JSON.stringify(updatedBox));
                console.log("Updated localStorage after court update");

                // Update state from response if available to be sure
                if (updatedBox.courts) {
                    setCourts(updatedBox.courts);
                }
            }

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
            // Transform state (openTime/closeTime) to API expectation (open/close)
            const payload = {};
            Object.keys(operatingHours).forEach(day => {
                const dayData = operatingHours[day];
                payload[day] = {
                    open: dayData.openTime,
                    close: dayData.closeTime,
                    isClosed: dayData.isClosed
                };
            });

            console.log("🚀 Sending Update Hours Payload:", JSON.stringify(payload, null, 2));

            const response = await axios.put(
                `${API_BASE_URL}/update-operating-hours/${boxId}`,
                payload,
                getAuthHeader()
            );
            console.log("Update Hours Response:", response.data);

            // UPDATE LOCAL STORAGE
            const updatedBox = response.data.box || response.data.data;
            if (updatedBox) {
                console.log("🔄 Updated Box from Response:", JSON.stringify(updatedBox.operatingHours, null, 2));
                localStorage.setItem('boxDetails', JSON.stringify(updatedBox));

                // CRITICAL FIX: Manually update context with the correct response
                // iterating refreshData() here causes a race condition with stale data from the server
                updateTurfDetails(updatedBox);

                console.log("💾 Updated localStorage after hours update");
            } else {
                console.warn("⚠️ No box data in response to update local storage");
            }

            // We can still trigger a background refresh if needed, but the manual update ensures UI correctness immediately
            // refreshData(); 

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
            const response = await axios.put(
                `${API_BASE_URL}/update-operating-hours/${boxId}`,
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Turf Management</h1>
                        <p className="text-muted-foreground mt-2">Manage your venue details, courts, and policies.</p>
                    </div>
                    <button
                        onClick={() => { refreshData(); }}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        Refresh Data
                    </button>
                </div>
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
                    <form onSubmit={handleUpdateGeneral} className="space-y-8">
                        {/* Basic Info */}
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
                                    type="text"
                                    value={generalInfo.pricePerHour}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, pricePerHour: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="e.g. 1500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1"><Phone className="w-4 h-4 inline mr-1" /> Phone Number</label>
                                <input
                                    type="tel"
                                    value={generalInfo.phoneNumber}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1"><MapPin className="w-4 h-4 inline mr-1" /> Address</label>
                                <textarea
                                    rows="1"
                                    value={generalInfo.location}
                                    onChange={(e) => setGeneralInfo({ ...generalInfo, location: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                                    placeholder="Full Address"
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

                        {/* Images Section */}
                        <div className="space-y-4 border-t border-border pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Turf Images</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newImage}
                                    onChange={(e) => setNewImage(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newImage.trim()) {
                                            setGeneralInfo({ ...generalInfo, images: [...generalInfo.images, newImage.trim()] });
                                            setNewImage('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {generalInfo.images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                                        <img src={img} alt={`Turf ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setGeneralInfo({ ...generalInfo, images: generalInfo.images.filter((_, i) => i !== idx) })}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Section */}
                        <div className="space-y-4 border-t border-border pt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Plus className="w-5 h-5" /> Amenities</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm"
                                    placeholder="Add Amenity (e.g. WiFi, Parking)"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newAmenity.trim()) {
                                                setGeneralInfo({ ...generalInfo, amenities: [...generalInfo.amenities, { name: newAmenity.trim(), available: true }] });
                                                setNewAmenity('');
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newAmenity.trim()) {
                                            setGeneralInfo({ ...generalInfo, amenities: [...generalInfo.amenities, { name: newAmenity.trim(), available: true }] });
                                            setNewAmenity('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {generalInfo.amenities.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-card border border-border rounded-lg">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.available}
                                                onChange={() => {
                                                    const newAmenities = [...generalInfo.amenities];
                                                    newAmenities[idx].available = !newAmenities[idx].available;
                                                    setGeneralInfo({ ...generalInfo, amenities: newAmenities });
                                                }}
                                                className="rounded border-primary text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">{item.name}</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setGeneralInfo({ ...generalInfo, amenities: generalInfo.amenities.filter((_, i) => i !== idx) })}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button disabled={loading} type="submit" className="btn-primary flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" /> Save General Info
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
                        <div className="grid grid-cols-1 gap-4">
                            {Object.keys(operatingHours).map((day) => (
                                <div key={day} className="p-4 border border-border rounded-lg bg-muted/5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        <div className="w-32">
                                            <span className="font-semibold capitalize text-foreground">{day}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="text-xs text-muted-foreground mb-1 block">Open</label>
                                                <div className="relative">
                                                    <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="time"
                                                        disabled={operatingHours[day].isClosed}
                                                        value={operatingHours[day].openTime}
                                                        onChange={(e) => setOperatingHours({
                                                            ...operatingHours,
                                                            [day]: { ...operatingHours[day], openTime: e.target.value }
                                                        })}
                                                        className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <label className="text-xs text-muted-foreground mb-1 block">Close</label>
                                                <div className="relative">
                                                    <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input
                                                        type="time"
                                                        disabled={operatingHours[day].isClosed}
                                                        value={operatingHours[day].closeTime}
                                                        onChange={(e) => setOperatingHours({
                                                            ...operatingHours,
                                                            [day]: { ...operatingHours[day], closeTime: e.target.value }
                                                        })}
                                                        className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:w-32 justify-end">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!operatingHours[day].isClosed}
                                                    onChange={(e) => setOperatingHours({
                                                        ...operatingHours,
                                                        [day]: { ...operatingHours[day], isClosed: !e.target.checked }
                                                    })}
                                                />
                                                <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                <span className="ml-2 text-sm font-medium text-muted-foreground w-12">
                                                    {!operatingHours[day].isClosed ? 'Open' : 'Closed'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button disabled={loading} type="submit" className="btn-primary flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" /> Update Weekly Schedule
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