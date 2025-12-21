'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
    Bell,
    Search,
    Settings,
    User,
    HelpCircle,
    ChevronDown,
    Menu,
    LayoutDashboard,
    Upload,
    FileText,
    Receipt,
    CreditCard,
    FileSpreadsheet,
    BarChart3,
    Activity,
    UserCircle,
    DollarSign,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";

// Mock user type if needed
interface NavbarProps {
    currentPage: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
    const { data: userResponse, isLoading } = useMe();
    const user = userResponse?.profile || userResponse?.user;

    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);

    const notifications = [
        { id: 1, title: 'Invoice processed', message: 'INV-2024-001 has been extracted', time: '2 min ago', unread: true },
        { id: 2, title: 'Report ready', message: 'Your monthly report is ready to download', time: '1 hour ago', unread: true },
        { id: 3, title: 'Upload complete', message: '5 documents uploaded successfully', time: '3 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Upload', href: '/upload', icon: Upload },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Receipts', href: '/receipts', icon: Receipt },
        { name: 'Bank Statements', href: '/bank-statements', icon: CreditCard },
        { name: 'Purchase Orders', href: '/purchase-orders', icon: FileSpreadsheet },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Usage', href: '/usage', icon: Activity },
        { name: 'Account', href: '/account', icon: UserCircle },
        { name: 'Billing', href: '/billing', icon: DollarSign },
    ];

    return (
        <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <div className="relative lg:hidden">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {showMobileMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMobileMenu(false)} />
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-20 max-h-[calc(100vh-80px)] overflow-y-auto">
                                    <div className="py-2">
                                        {menuItems.map((item) => {
                                            const Icon = item.icon;
                                            // Simple active check
                                            const isActive = currentPage === item.name;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setShowMobileMenu(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                                                        isActive
                                                            ? "text-[#635BFF] bg-[#635BFF]/5"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    <div className="py-2 border-t border-slate-100">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search */}

                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/upload"
                        className="hidden sm:inline-flex"
                    >
                        <Button size="sm">
                            Upload Documents
                        </Button>
                    </Link>

                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <HelpCircle className="h-5 w-5" />
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-20">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0",
                                                    notification.unread && "bg-blue-50/50"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {notification.unread && (
                                                        <span className="mt-1.5 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                    )}
                                                    <div className={cn(!notification.unread && "ml-5")}>
                                                        <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                                        <p className="text-sm text-slate-500 mt-0.5">{notification.message}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                                        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <div className="h-8 w-8 bg-gradient-to-br from-[#635BFF] to-[#635BFF] rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                                {((user as { full_name?: string })?.full_name?.charAt(0) || user?.email?.charAt(0)) || 'U'}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-slate-700">
                                {(user as { full_name?: string })?.full_name || 'User'}
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-20">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900">{(user as { full_name?: string })?.full_name || 'User'}</p>
                                        <p className="text-sm text-slate-500">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            href="/account"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                            Account Settings
                                        </Link>
                                        <Link
                                            href="/billing"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Billing
                                        </Link>
                                    </div>
                                    <div className="py-2 border-t border-slate-100">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
