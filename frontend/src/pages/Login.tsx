import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, BookOpen, Shield } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await client.post('/auth/login', { email, password });
            const { token, role, name, email: userEmail } = response.data;
            login(token, role, { name, email: userEmail });
            
            if (role === 'ADMIN') {
                navigate('/admin');
            } else if (role === 'TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background-app text-gray-900 dark:text-gray-100 font-sans">
            {/* Left side - Form */}
            <div className="flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24 xl:px-32 relative z-10 bg-background-surface">
                <div className="mx-auto w-full max-w-sm animate-fade-in">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-soft">
                            <GraduationCap className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Eduvault</h1>
                    </div>

                    <h2 className="mb-2 text-2xl font-bold tracking-tight">Welcome back</h2>
                    <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
                        Enter your credentials to access your account.
                    </p>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-slide-up border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
                                Email address
                            </label>
                            <input
                                className="modern-input"
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="modern-input"
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            className="modern-button w-full mt-4 group"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Secure connection via Eduvault authentication
                    </div>
                </div>
            </div>

            {/* Right side - Abstract Graphic/Promo */}
            <div className="hidden w-1/2 bg-gray-50 dark:bg-zinc-900 md:flex flex-col justify-center items-center relative overflow-hidden border-l border-border-subtle">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>
                
                <div className="relative z-10 max-w-lg px-12 text-center animate-slide-up">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                        The modern operating system for your classroom.
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                        Manage students, create engaging assessments, and track progress all in one unified platform.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-6 rounded-2xl backdrop-blur-md border border-white/20 dark:border-zinc-700/50 shadow-soft">
                            <BookOpen className="text-primary mb-3" size={24} />
                            <h3 className="font-semibold mb-1 dark:text-white">Smart Classrooms</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Organize seamlessly</p>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-6 rounded-2xl backdrop-blur-md border border-white/20 dark:border-zinc-700/50 shadow-soft mt-6">
                            <Shield className="text-primary mb-3" size={24} />
                            <h3 className="font-semibold mb-1 dark:text-white">Secure Assessments</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise grade testing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
