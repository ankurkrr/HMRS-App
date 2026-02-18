import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/** Format ISO date string as readable date */
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/** Format time string (HH:MM:SS or HH:MM) as 12-hour */
export function formatTime(time: string | null): string {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

/** Debounce helper */
export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    ms: number,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
