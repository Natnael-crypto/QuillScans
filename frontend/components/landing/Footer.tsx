import React from 'react';
import Link from 'next/link';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

const footerLinks = {
    Product: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Integrations', href: '#' },
        { name: 'Changelog', href: '#' },
    ],
    Company: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Contact', href: '#' },
    ],
    Resources: [
        { name: 'Documentation', href: '#' },
        { name: 'Help Center', href: '#' },
        { name: 'API Reference', href: '#' },
        { name: 'Status', href: '#' },
    ],
    Legal: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-primary text-white">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                width={30}
                                height={30}
                            ></img>
                            <span className="text-xl font-bold">QuillScans</span>
                        </Link>
                        <p className="text-white/60 mb-6 max-w-xs">
                            Automate your document workflow with AI-powered extraction and intelligent processing.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-white/60 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} DocuFlow. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <span>SOC 2 Certified</span>
                        <span>GDPR Compliant</span>
                        <span>ISO 27001</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}