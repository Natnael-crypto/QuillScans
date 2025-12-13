"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
}: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in-0">
            <div
                className={cn(
                    "relative w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-200 animate-in zoom-in-95",
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                        {description && (
                            <p className="text-sm text-slate-500 mt-1">{description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
