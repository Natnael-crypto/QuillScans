'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Determine if it's a public page (Landing, Login, etc.)
    // We consider root '/' as public landing page.
    // Add other public routes like '/login' or '/register' if needed.
    const isPublicPage = pathname === '/' || pathname === '/auth';

    // Determine current page name
    let currentPageName = "";
    if (pathname === '/') {
        currentPageName = "Landing";
    } else {
        // Remove leading slash and capitalize first letter
        const segment = pathname.split('/')[1] || "";
        currentPageName = segment.charAt(0).toUpperCase() + segment.slice(1);
        // Handle edge cases or specific names if needed, e.g. "dashboard" -> "Dashboard" is handled.
    }

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Dummy user for now
    const user = { full_name: "Demo User", email: "demo@example.com" };

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPageName}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <Navbar
                    user={user}
                    currentPage={currentPageName}
                />
                <main className="pt-16">
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
