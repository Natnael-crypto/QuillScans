import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Upload,
    FileText,
    Receipt,
    Building2,
    ShoppingCart,
    BarChart3,
    Activity,
    User,
    CreditCard,
    Settings,
    LogOut,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Zap
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
    name: string;
    href?: string;
    icon: LucideIcon;
    children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: 'Upload', icon: Upload },
    {
        name: 'Documents',
        icon: FileText,
        children: [
            { name: 'Invoices', href: 'Invoices', icon: Receipt },
            { name: 'Receipts', href: 'Receipts', icon: Receipt },
            // { name: 'Bank Statements', href: 'Bank', icon: Building2 },
            { name: 'Purchase Orders', href: 'pos', icon: ShoppingCart },
        ]
    },
    { name: 'Reports', href: 'Reports', icon: BarChart3 },
    { name: 'Usage', href: 'Usage', icon: Activity },
];

const bottomNav: NavigationItem[] = [
    { name: 'Account', href: 'Account', icon: User },
    { name: 'Billing', href: 'Billing', icon: CreditCard },
];

interface SidebarProps {
    currentPage: string;
    isCollapsed?: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ currentPage, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const [expandedItems, setExpandedItems] = React.useState(['Documents']);

    const toggleExpanded = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    

    const NavItem = ({ item, isChild = false }: { item: NavigationItem; isChild?: boolean }) => {
        const isActive = currentPage === item.href;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.name);
        const Icon = item.icon;

        if (hasChildren) {
            return (
                <div>
                    <button
                        onClick={() => toggleExpanded(item.name)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                        title={item.name}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )} />
                        )}
                    </button>
                    {isExpanded && !isCollapsed && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.children?.map((child) => (
                                <NavItem key={child.name} item={child} isChild />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={`/${(item.href ?? '').toLowerCase()}`}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                    isActive
                        ? "text-[#635BFF]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    isChild && !isCollapsed && "pl-6",
                    isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : undefined}
            >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}

                {/* Tooltip for collapsed state */}
                {isCollapsed && !isChild && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
                        {item.name}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <aside className={cn(
            "hidden lg:fixed left-0 top-0 h-screen bg-white border-r border-slate-200 lg:flex flex-col z-40 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <Link href="/" className={cn(
                    "flex items-center gap-2 transition-opacity",
                    isCollapsed && "opacity-0"
                )}>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        width={30}
                        height={30}
                    ></img>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-slate-900">QuillScans</span>
                    )}
                </Link>

                {/* Collapse Button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                    ) : (
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                    )}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="px-4 py-4 border-t border-slate-100 space-y-1">
                {bottomNav.map((item) => (
                    <NavItem key={item.name} item={item} />
                ))}
                <button
                    onClick={() => {/* logout handler */ }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Log out</span>}
                </button>
            </div>

            {/* Usage Indicator */}
            {!isCollapsed && (
                <div className="mx-4 mb-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Monthly Usage</span>
                        <span className="font-semibold text-slate-900">142/200</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#635BFF] rounded-full" style={{ width: '71%' }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">58 documents remaining</p>
                </div>
            )}
        </aside>
    );
}