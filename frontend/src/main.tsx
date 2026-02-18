import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/app/queryClient';
import { router } from '@/routes/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        padding: '0.75rem 1rem',
                    },
                }}
            />
        </QueryClientProvider>
    </StrictMode>,
);
