import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'employees', element: <EmployeesPage /> },
            { path: 'attendance', element: <AttendancePage /> },
        ],
    },
]);
