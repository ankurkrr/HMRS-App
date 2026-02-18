import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

const navigation = [
    { label: 'Dashboard', path: '/', icon: HomeIcon },
    { label: 'Employees', path: '/employees', icon: UsersIcon },
    { label: 'Attendance', path: '/attendance', icon: ClipboardDocumentCheckIcon },
];

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/employees': 'Employee Management',
    '/attendance': 'Attendance Management',
};

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] ?? 'HRMS Lite';

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 shadow-sm transition-transform duration-200 lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                            HR
                        </div>
                        <span className="text-base font-semibold text-gray-900">HRMS Lite</span>
                    </div>
                    <button
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                )
                            }
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4">
                    <p className="text-xs text-gray-400">HRMS Lite v1.0</p>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
                    <button
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
