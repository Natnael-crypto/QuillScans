"use client";

import React, { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2 } from 'lucide-react';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Auth() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialMode = urlParams.get('mode') || 'login';

    const [mode, setMode] = useState(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        company: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // Create user account
                console.log(formData);
            }

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            // Google OAuth would be handled by Base44
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                            <Zap className="h-6 w-6 text-accent" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">DocuFlow</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="text-slate-600 mb-8">
                        {mode === 'login'
                            ? 'Sign in to your account to continue'
                            : 'Get started with your free trial'
                        }
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Google Auth */}
                    <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 h-12 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors mb-6 disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-medium text-slate-700">
                            Continue with Google
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <Label htmlFor="full_name">Full name</Label>
                                <Input
                                    id="full_name"
                                    type="text"
                                    placeholder="John Smith"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    leftIcon={<User className="h-5 w-5" />}
                                    required
                                />
                                <Label htmlFor="company">Company name</Label>
                                <Input
                                    id="company"
                                    type="text"
                                    placeholder="Acme Inc"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    leftIcon={<Building2 className="h-5 w-5" />}
                                />
                            </>
                        )}

                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            leftIcon={<Mail className="h-5 w-5" />}
                            required
                        />

                        <div className="relative">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                leftIcon={<Lock className="h-5 w-5" />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {mode === 'login' && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <button type="button" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {mode === 'signup' && (
                            <p className="text-xs text-slate-500">
                                By signing up, you agree to our{' '}
                                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </p>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            {mode === 'login' ? 'Sign in' : 'Create account'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-600 mt-6">
                        {mode === 'login' ? (
                            <>
                                Don&apos;t have an account?
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Sign up free
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
                <div className="max-w-lg text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
                            <span className="text-accent text-sm font-medium">✨ AI-Powered</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {mode === 'login'
                                ? 'Extract data from documents in seconds'
                                : 'Start automating your document workflow today'
                            }
                        </h2>
                        <p className="text-white/70 text-lg">
                            {mode === 'login'
                                ? 'Upload invoices, receipts, and bank statements. Get structured data instantly.'
                                : 'Join thousands of finance teams saving hours every week.'
                            }
                        </p>
                    </div>

                    {mode === 'signup' ? (
                        <div className="space-y-4">
                            {['200 free documents per month', 'No credit card required', 'Setup in under 5 minutes', 'Cancel anytime'].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-6 w-6 bg-accent rounded-full flex items-center justify-center">
                                        <span className="text-primary text-sm">✓</span>
                                    </div>
                                    <span className="text-white">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative h-64">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="absolute left-0 top-0 bg-white rounded-xl p-4 shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Invoice processed</p>
                                        <p className="text-sm font-semibold text-slate-900">$2,450.00</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="absolute right-0 top-10 bg-white rounded-xl p-4 shadow-lg"
                            >
                                <div className="text-sm text-slate-900 font-medium mb-2">Extracted Fields</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Vendor:</span>
                                        <span className="text-slate-900">Acme Corp</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date:</span>
                                        <span className="text-slate-900">Jan 15, 2024</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="absolute left-20 bottom-0 bg-accent text-primary px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                            >
                                99.2% accuracy
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}