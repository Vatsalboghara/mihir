import { useState } from 'react';
import axios from 'axios';
import { AUTH_API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Building2, User, ArrowRight, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newAmenity, setNewAmenity] = useState('');

    // Combined state for both steps
    const [formData, setFormData] = useState({
        // Step 1: User Details
        userName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'admin',

        // Step 2: Business Details
        businessName: '',
        location: '',
        bankAccount: '',
        ifsCode: '',
        pricePerHour: '',
        description: '',

        // Arrays
        courts: [
            {
                courtNumber: 1,
                courtName: "Main Turf",
                surfaceType: "Artificial Turf",
                isAvailable: true,
                maxPlayers: 10,
                images: ["https://placehold.co/600x400"]
            }
        ],
        amenities: [
            { name: "Parking", available: true },
            { name: "Washroom", available: true },
            { name: "Lighting", available: true },
            { name: "Drinking Water", available: true }
        ]
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCourtChange = (index, field, value) => {
        const newCourts = [...formData.courts];
        newCourts[index][field] = value;
        setFormData({ ...formData, courts: newCourts });
    };

    const handleCourtImageChange = (courtIndex, imageIndex, value) => {
        const newCourts = [...formData.courts];
        newCourts[courtIndex].images[imageIndex] = value;
        setFormData({ ...formData, courts: newCourts });
    };

    const addCourtImage = (courtIndex) => {
        const newCourts = [...formData.courts];
        newCourts[courtIndex].images.push('');
        setFormData({ ...formData, courts: newCourts });
    };

    const removeCourtImage = (courtIndex, imageIndex) => {
        const newCourts = [...formData.courts];
        if (newCourts[courtIndex].images.length > 1) {
            newCourts[courtIndex].images = newCourts[courtIndex].images.filter((_, i) => i !== imageIndex);
            setFormData({ ...formData, courts: newCourts });
        } else {
            // If it's the last one, just clear it or decide policy. 
            // Let's allow clearing the value but keep the input or remove it?
            // "owner can upload multiple" implies at least one usually. 
            // If length is 1, let's just clear the value.
            newCourts[courtIndex].images[0] = '';
            setFormData({ ...formData, courts: newCourts });
        }
    };

    const addCourt = () => {
        setFormData({
            ...formData,
            courts: [
                ...formData.courts,
                {
                    courtNumber: formData.courts.length + 1,
                    courtName: `Court ${formData.courts.length + 1} `,
                    surfaceType: "Artificial Turf",
                    isAvailable: true,
                    maxPlayers: 10,
                    images: ["https://placehold.co/600x400"]
                }
            ]
        });
    };

    const removeCourt = (index) => {
        if (formData.courts.length > 1) {
            const newCourts = formData.courts.filter((_, i) => i !== index);
            setFormData({ ...formData, courts: newCourts });
        } else {
            toast.error("You must have at least one court.");
        }
    };

    const handleAmenityToggle = (index) => {
        const newAmenities = [...formData.amenities];
        newAmenities[index].available = !newAmenities[index].available;
        setFormData({ ...formData, amenities: newAmenities });
    };

    const addAmenity = () => {
        if (!newAmenity.trim()) {
            toast.error("Please enter an amenity name");
            return;
        }
        // Check for duplicates
        if (formData.amenities.some(a => a.name.toLowerCase() === newAmenity.trim().toLowerCase())) {
            toast.error("Amenity already exists");
            return;
        }

        setFormData({
            ...formData,
            amenities: [...formData.amenities, { name: newAmenity.trim(), available: true }]
        });
        setNewAmenity('');
        toast.success("Amenity added");
    };

    const removeAmenity = (index) => {
        const newAmenities = formData.amenities.filter((_, i) => i !== index);
        setFormData({ ...formData, amenities: newAmenities });
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                name: formData.userName,
                email: formData.email,
                password: formData.password,
                role: 'admin',
                phoneNumber: formData.phoneNumber
            };

            const response = await axios.post(`${AUTH_API_URL}/signup`, payload);
            console.log('User Registered:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userName', formData.userName);
                localStorage.setItem('userEmail', formData.email);
                window.dispatchEvent(new Event("storage")); // Trigger Header update
                toast.success('Registration Successful! Please check your email.');
                setStep(2);
            } else {
                // Fallback if no token is sent
                toast.error('Token not found in response');
                // Even if token is missing, if we proceed, we should store user data?
                // But here we setStep(1), so we don't proceed.
                setStep(1);
            }

        } catch (err) {
            console.error('Step 1 Error:', err);
            const msg = err.response?.data?.message || 'Registration failed.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                name: formData.businessName,
                location: formData.location,
                phoneNumber: formData.phoneNumber,
                BankAccount: formData.bankAccount,
                IFSCode: formData.ifsCode,
                pricePerHour: Number(formData.pricePerHour),
                description: formData.description,
                isActive: true,
                courts: formData.courts,
                amenities: formData.amenities
            };

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token} ` })
                }
            };

            console.log("Sending Final Payload:", payload); // Debugging

            const response = await axios.post(`${AUTH_API_URL}/admin`, payload, config);
            console.log('Business Registered:', response.data);

            if (response.data && response.data.box && response.data.box._id) {
                localStorage.setItem('boxId', response.data.box._id);
                localStorage.setItem('boxDetails', JSON.stringify(response.data.box)); // Store full details for pre-fill
                console.log("Box ID saved:", response.data.box._id);
            } else {
                console.error("Box ID not found in response:", response.data);
                // Fallback check if it's in the root
                if (response.data && response.data._id) {
                    localStorage.setItem('boxId', response.data._id);
                }
            }

            toast.success('Venue Registered Successfully!');
            navigate('/');
        } catch (err) {
            console.error('Step 2 Error:', err);
            const msg = err.response?.data?.message || 'Failed to register venue details.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans text-foreground">
            {/* Navbar for Signup Page */}
            <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
                    <span className="text-xl font-bold text-foreground">TurfManager</span>
                </div>
                {/* <div className="text-sm text-muted-foreground">
                    Already a partner? <a href="#" className="text-primary font-medium hover:underline">Login</a>
                </div> */}
            </div>

            <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">

                {/* Left Side: Form */}
                <div className="flex-1 bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">

                    {/* Stepper */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex items - center gap - 2 ${step === 1 ? 'text-primary' : 'text-primary/70'} `}>
                            <div className={`w - 8 h - 8 rounded - full flex items - center justify - center border - 2 font - bold ${step === 1 ? 'border-primary bg-primary/10' : 'border-primary/30 bg-primary/5'} `}>
                                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="font-semibold text-sm">EMAIL & PASSWORD</span>
                        </div>
                        <div className="w-12 h-[2px] bg-border"></div>
                        <div className={`flex items - center gap - 2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'} `}>
                            <div className={`w - 8 h - 8 rounded - full flex items - center justify - center border - 2 font - bold ${step === 2 ? 'border-primary bg-primary/10' : 'border-border'} `}>
                                2
                            </div>
                            <span className="font-semibold text-sm">BUSINESS DETAILS</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleStep1Submit} className="space-y-5">
                            {/* Step 1 Fields (Unchanged) */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Enter Mobile Number <span className="text-destructive">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">+91</span>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Full Name <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Email ID <span className="text-destructive">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Create Password <span className="text-destructive">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Register & Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleStep2Submit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">

                            {/* Basic Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Business Name <span className="text-destructive">*</span></label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="e.g. Box & Bounce"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Price Per Hour (₹) <span className="text-destructive">*</span></label>
                                        <input
                                            type="number"
                                            name="pricePerHour"
                                            value={formData.pricePerHour}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="e.g. 1200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Location / Address <span className="text-destructive">*</span></label>
                                    <textarea
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        rows="2"
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Full address of your turf"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Describe your venue amenities and vibe..."
                                    />
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Bank Account No <span className="text-destructive">*</span></label>
                                        <input
                                            type="text"
                                            name="bankAccount"
                                            value={formData.bankAccount}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Account Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">IFS Code <span className="text-destructive">*</span></label>
                                        <input
                                            type="text"
                                            name="ifsCode"
                                            value={formData.ifsCode}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="HDFC0001234"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Amenities Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Amenities</h3>

                                {/* Add Amenity Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        placeholder="Add amenity (e.g. CCTV, Café)"
                                        className="flex-1 px-4 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addAmenity();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addAmenity}
                                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {formData.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors group bg-card hover:shadow-sm">
                                            <label className="flex items-center space-x-2 cursor-pointer mr-2">
                                                <input
                                                    type="checkbox"
                                                    checked={amenity.available}
                                                    onChange={() => handleAmenityToggle(index)}
                                                    className="w-4 h-4 text-primary rounded focus:ring-primary shrink-0"
                                                />
                                                <span className="text-sm text-foreground break-words">{amenity.name}</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeAmenity(index)}
                                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer shrink-0"
                                                title="Remove amenity"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Courts Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-lg font-semibold text-foreground">Courts</h3>
                                    <button type="button" onClick={addCourt} className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                                        <Plus className="w-4 h-4" /> Add Court
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.courts.map((court, index) => (
                                        <div key={index} className="bg-muted/10 p-4 rounded-xl border border-border relative group">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={court.courtName}
                                                        onChange={(e) => handleCourtChange(index, 'courtName', e.target.value)}
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Max Players</label>
                                                    <input
                                                        type="number"
                                                        value={court.maxPlayers}
                                                        onChange={(e) => handleCourtChange(index, 'maxPlayers', Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Surface</label>
                                                    <select
                                                        value={court.surfaceType}
                                                        onChange={(e) => handleCourtChange(index, 'surfaceType', e.target.value)}
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                    >
                                                        <option>Artificial Turf</option>
                                                        <option>Natural Grass</option>
                                                        <option>Synthetic</option>
                                                        <option>Clay</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-xs font-medium text-muted-foreground">Turf Images</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addCourtImage(index)}
                                                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add URL
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {court.images.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={img}
                                                                    onChange={(e) => handleCourtImageChange(index, imgIndex, e.target.value)}
                                                                    placeholder="https://example.com/image.jpg"
                                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                                                />
                                                                {court.images.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeCourtImage(index, imgIndex)}
                                                                        className="text-muted-foreground hover:text-destructive p-2"
                                                                        title="Remove Image"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-end">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={court.isAvailable}
                                                            onChange={(e) => handleCourtChange(index, 'isAvailable', e.target.checked)}
                                                        />
                                                        <span className="text-sm">Available for Booking</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {formData.courts.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCourt(index)}
                                                    className="absolute top-2 right-2 p-1 text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 mt-8 py-3 text-base"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Complete Registration <Building2 className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-muted-foreground text-sm hover:text-foreground hover:underline mt-2"
                            >
                                Back to User Details
                            </button>
                        </form>
                    )}

                    <p className="text-xs text-muted-foreground mt-6 text-center">
                        By continuing, I agree to Terms of Use & Privacy Policy
                    </p>
                </div>

                {/* Right Side: Promo Content (Unchanged) */}
                <div className="hidden lg:block w-96 space-y-6">
                    <div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Starting with 1 Turf?</h3>
                            <p className="text-primary-foreground/90 text-sm mb-4">
                                "TurfManager helped me expand to 3 locations with 5x revenue growth year on year!"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">R</div>
                                <div>
                                    <p className="text-sm font-semibold">Raju Bhai</p>
                                    <p className="text-xs text-primary-foreground/80">Owner, Rajkot Arena</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    </div>

                    <div className="bg-warning rounded-2xl p-8 text-center shadow-lg">
                        <h3 className="text-2xl font-black text-warning-foreground mb-2 uppercase">Manage Like a Pro</h3>
                        <p className="text-warning-foreground/90 font-medium mb-6">Automated Bookings • Analytics • Customers</p>
                        <div className="bg-white/30 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                            <p className="text-3xl font-bold text-warning-foreground">1000+</p>
                            <p className="text-xs font-semibold text-warning-foreground/80 uppercase tracking-wide">Turfs Onboarded</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
