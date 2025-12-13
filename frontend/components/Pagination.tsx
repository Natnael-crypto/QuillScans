import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    showItemCount?: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showItemCount = true
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5;

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between py-4 px-2">
            {showItemCount && (
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-700">{startItem}</span> to{' '}
                    <span className="font-medium text-slate-700">{endItem}</span> of{' '}
                    <span className="font-medium text-slate-700">{totalItems}</span> results
                </p>
            )}

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        currentPage === 1
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                "min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                                currentPage === page
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        currentPage === totalPages
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}