import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }

        // Trigger form entrance after ball animation
        const timer = setTimeout(() => setShowForm(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const response = await axios.post('https://nonsolidified-annika-criminally.ngrok-free.dev/api/auth/login', formData);
            const data = response.data;

            console.log("Login Success:", data);

            // Store Data - Assuming standard structure, matching Signup logic
            // Adjust these key paths based on your actual Login API response structure!
            // Usually login returns { token, user: { name, email, ... }, box: { ... } } or similar
            if (data.token) localStorage.setItem('token', data.token);

            // Safe checks for user details
            const user = data.user || data.admin || {}; // Fallback for different API structures
            if (user.name) localStorage.setItem('userName', user.name);
            if (user.email) localStorage.setItem('userEmail', user.email);

            // Creating box details from response if available, or just ID
            const box = data.box || (user.boxId ? { _id: user.boxId } : null);
            if (box && box._id) {
                localStorage.setItem('boxId', box._id);
                localStorage.setItem('boxDetails', JSON.stringify(box));
            }

            // Dispatch event for Header update
            window.dispatchEvent(new Event("storage"));

            toast.success("Welcome back!");
            navigate('/');

        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md relative z-10 px-6">

                {/* Cricket Ball Animation Container */}
                <div className="mb-8 flex justify-center relative h-24">
                    <div className="animate-roll-in absolute left-1/2 -translate-x-1/2">
                        {/* CSS Cricket Ball */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 shadow-2xl relative border border-red-950 flex items-center justify-center overflow-hidden">
                            {/* Seam */}
                            <div className="absolute w-[120%] h-full border-4 border-dotted border-white/80 rounded-full opacity-90 transform -rotate-45 scale-x-50"></div>
                            {/* Shine */}
                            <div className="absolute top-2 left-3 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className={`transition-all duration-700 ease-out transform ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-8 backdrop-blur-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Enter your credentials to access the dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@turf.com"
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'border-muted-foreground group-hover:border-primary'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        {rememberMe && <div className="w-2 h-2 bg-black rounded-sm" />}
                                    </div>
                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                                </label>
                                <span
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                >
                                    Forgot password?
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:underline font-medium">
                                Create new account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes roll-in {
                    0% {
                        transform: translateX(-100vw) rotate(-720deg);
                        opacity: 0;
                    }
                    60% {
                        transform: translateX(20px) rotate(20deg);
                        opacity: 1;
                    }
                    80% {
                        transform: translateX(-10px) rotate(-10deg);
                    }
                    100% {
                        transform: translateX(0) rotate(0);
                        opacity: 1;
                    }
                }
                .animate-roll-in {
                    animation: roll-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>
    );
}
