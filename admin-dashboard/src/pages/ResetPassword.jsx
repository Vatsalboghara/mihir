import { useState } from 'react';
import axios from 'axios';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AUTH_API_URL } from '../config/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('resetToken');
    console.log(token);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            // Using localhost as per prompt request: http://localhost:5000/api/auth/reset-password/TOKEN
            // Payload usually expects { password }
            console.log("token is passthrough header amin try block", token);

            const response = await axios.post(`https://nonsolidified-annika-criminally.ngrok-free.dev/api/auth/reset-password?resetToken=${token}`, {
                newPassword: formData.password
            });
            console.log("Reset Password Response:", response.data);

            toast.success("Password reset successfully!");

            // Redirect to login after short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error("Reset Password Error:", error);
            const msg = error.response?.data?.message || "Failed to reset password. Link might be expired.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md relative z-10 px-6">
                <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-8 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Confirm Password</label>
                            <div className="relative group">
                                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-xl outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
