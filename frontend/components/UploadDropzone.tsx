"use client"

import React, { useCallback, useState } from 'react';
import { cn } from "@/lib/utils";
import {
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Image as ImageIcon,
    FileSpreadsheet
} from "lucide-react";

const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return ImageIcon;
    if (type.includes('spreadsheet') || type.includes('xlsx')) return FileSpreadsheet;
    return FileText;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileItem {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    preview: string | null;
}

interface UploadDropzoneProps {
    onFilesSelected?: (files: FileItem[]) => void;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
}

export default function UploadDropzone({
    onFilesSelected,
    maxFiles = MAX_FILES,
    maxSize = MAX_FILE_SIZE,
    disabled = false
}: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const validateFile = useCallback((file: File) => {
        const errors = [];

        // Check file type
        const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
        if (!acceptedTypes.includes(file.type)) {
            errors.push(`${file.name}: File type not supported`);
        }

        // Check file size
        if (file.size > maxSize) {
            errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)}`);
        }

        return errors;
    }, [maxSize]);

    const handleFiles = useCallback((newFiles: FileList) => {
        const fileArray = Array.from(newFiles);
        const validationErrors: string[] = [];
        const validFiles: FileItem[] = [];

        // Check max files limit
        if (files.length + fileArray.length > maxFiles) {
            validationErrors.push(`Maximum ${maxFiles} files allowed`);
            return;
        }

        fileArray.forEach((file) => {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                validationErrors.push(...fileErrors);
            } else {
                validFiles.push({
                    file,
                    id: `${file.name}-${Date.now()}`,
                    progress: 0,
                    status: 'pending',
                    preview: file.type.includes('image') ? URL.createObjectURL(file) : null
                });
            }
        });

        setErrors(validationErrors);
        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            onFilesSelected?.(validFiles);
        }
    }, [files.length, maxFiles, onFilesSelected, validateFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!disabled && e.dataTransfer.files?.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [disabled, handleFiles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileStatus = (id: string, status: FileItem['status'], progress = 0) => {
        setFiles(prev => prev.map(f =>
            f.id === id ? { ...f, status, progress } : f
        ));
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300",
                    isDragging
                        ? "border-accent bg-accent/5 scale-[1.02]"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <input
                    type="file"
                    multiple
                    accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={disabled}
                />

                <div className="text-center">
                    <div className={cn(
                        "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        isDragging ? "bg-accent/20" : "bg-slate-100"
                    )}>
                        <Upload className={cn(
                            "h-8 w-8 transition-colors",
                            isDragging ? "text-accent" : "text-slate-400"
                        )} />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {isDragging ? "Drop files here" : "Drag and drop your files"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        or click to browse from your computer
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
                        <span className="px-2 py-1 bg-slate-100 rounded">PDF</span>
                        <span className="px-2 py-1 bg-slate-100 rounded">JPG</span>
                        <span className="px-2 py-1 bg-slate-100 rounded">PNG</span>
                        <span className="px-2 py-1 bg-slate-100 rounded">DOCX</span>
                        <span className="px-2 py-1 bg-slate-100 rounded">XLSX</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-3">
                        Max {maxFiles} files, up to {formatFileSize(maxSize)} each
                    </p>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Upload errors</h4>
                            <ul className="mt-1 text-sm text-red-600 space-y-1">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700">
                        Selected files ({files.length}/{maxFiles})
                    </h4>
                    <div className="space-y-2">
                        {files.map((fileItem) => {
                            const Icon = getFileIcon(fileItem.file.type);
                            return (
                                <div
                                    key={fileItem.id}
                                    className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl"
                                >
                                    {/* Preview/Icon */}
                                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {fileItem.preview ? (
                                            <img
                                                src={fileItem.preview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Icon className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {fileItem.file.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatFileSize(fileItem.file.size)}
                                        </p>

                                        {/* Progress Bar */}
                                        {fileItem.status === 'uploading' && (
                                            <div className="mt-2">
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent rounded-full transition-all duration-300"
                                                        style={{ width: `${fileItem.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status/Actions */}
                                    <div className="flex-shrink-0">
                                        {fileItem.status === 'pending' && (
                                            <button
                                                onClick={() => removeFile(fileItem.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                        {fileItem.status === 'uploading' && (
                                            <Loader2 className="h-5 w-5 text-accent animate-spin" />
                                        )}
                                        {fileItem.status === 'complete' && (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        )}
                                        {fileItem.status === 'error' && (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}