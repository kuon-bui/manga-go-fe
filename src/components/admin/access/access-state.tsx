import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AccessStateProps {
  title: string;
  message?: string;
  retry?: () => void;
}

export function AccessState({ title, message, retry }: AccessStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {message ? <p className="max-w-md text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {retry ? (
        <Button type="button" variant="outline" onClick={retry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}

export type { AccessStateProps };
