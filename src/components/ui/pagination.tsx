import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [8, 16, 24],
  className
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4 py-8", className)}>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === 'ellipsis' ? (
                <div className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "h-9 w-9",
                    currentPage === page ? "bg-red-600 hover:bg-red-700 text-white" : ""
                  )}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {onItemsPerPageChange && itemsPerPage && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Profiles per page:</span>
          <div className="flex items-center space-x-1">
            {itemsPerPageOptions.map((option) => (
              <Button
                key={option}
                variant={itemsPerPage === option ? "default" : "outline"}
                size="sm"
                onClick={() => onItemsPerPageChange(option)}
                className={cn(
                  "h-8 px-3",
                  itemsPerPage === option ? "bg-red-600 hover:bg-red-700 text-white" : ""
                )}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
