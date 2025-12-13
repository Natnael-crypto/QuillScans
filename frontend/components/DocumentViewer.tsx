"use"

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    Maximize2,
    FileText,
    Image as ImageIcon,
    Loader2
} from "lucide-react";
import { Button } from './ui/button';

interface DocumentViewerProps {
    fileUrl: string;
    fileType?: string;
    fileName?: string;
    className?: string;
}

export default function DocumentViewer({
    fileUrl,
    fileType = 'pdf',
    fileName,
    className
}: DocumentViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderViewer = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <FileText className="h-16 w-16 mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Unable to load document</p>
                    <p className="text-sm mt-1">{error}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download instead
                    </Button>
                </div>
            );
        }

        const isPDF = fileType === 'pdf' || fileUrl?.endsWith('.pdf');
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType) ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

        if (isPDF) {
            return (
                <div className="relative h-full">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={`${fileUrl}#toolbar=0`}
                        className="w-full h-full border-0"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'top left'
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setError('Failed to load PDF');
                        }}
                        title="Document viewer"
                    />
                </div>
            );
        }

        if (isImage) {
            return (
                <div className="flex items-center justify-center h-full overflow-auto p-4">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                        </div>
                    )}
                    <img
                        src={fileUrl}
                        alt={fileName || 'Document'}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setError('Failed to load image');
                        }}
                    />
                </div>
            );
        }

        // Fallback for unsupported types
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <FileText className="h-16 w-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium">Preview not available</p>
                <p className="text-sm mt-1">This file type cannot be previewed</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download file
                </Button>
            </div>
        );
    };

    return (
        <div className={cn("flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                        {fileName || 'Document'}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-600 min-w-[48px] text-center">{zoom}%</span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <button
                        onClick={handleRotate}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Rotate"
                    >
                        <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-slate-100 min-h-[400px] relative">
                {renderViewer()}
            </div>
        </div>
    );
}