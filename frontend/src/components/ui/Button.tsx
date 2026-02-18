import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
    primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 shadow-sm',
    destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
};

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
