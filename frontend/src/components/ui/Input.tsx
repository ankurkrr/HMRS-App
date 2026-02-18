import { forwardRef } from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, className, ...props }, ref) => {
        return (
            <div>
                {label && (
                    <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    aria-invalid={!!error}
                    className={cn(
                        'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30',
                        className,
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
