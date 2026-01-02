import { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Using localhost as per prompt request: http://localhost:5000/api/auth/forget-password
            const response = await axios.post('https://nonsolidified-annika-criminally.ngrok-free.dev/api/auth/forget-password', { email });
            console.log("Forgot Password Response:", response.data);

            toast.success("Reset link sent to your email!");
            setSubmitted(true);
        } catch (error) {
            console.error("Forgot Password Error:", error);
            const msg = error.response?.data?.message || "Failed to send reset link. Please try again.";
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

            <div className="w-full max-w-md relative z-10 px-6">
                <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-8 backdrop-blur-xl transition-all duration-300">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {submitted
                                ? "Check your email for the reset link."
                                : "Enter your email address and we'll send you a link to reset your password."}
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@turf.com"
                                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                                <p className="text-sm text-primary font-medium">Link sent to {email}</p>
                            </div>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
