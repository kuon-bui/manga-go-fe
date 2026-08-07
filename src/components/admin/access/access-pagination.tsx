import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AccessPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (_page: number) => void;
}

export function AccessPagination({ page, limit, total, onPageChange }: AccessPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between gap-3 border-t px-1 pt-4">
      <p className="text-sm text-muted-foreground">
        Trang {page}/{totalPages} · {total} kết quả
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export type { AccessPaginationProps };
