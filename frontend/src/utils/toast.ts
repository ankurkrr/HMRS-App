import toast from 'react-hot-toast';

export const showSuccess = (message: string) =>
    toast.success(message, { duration: 3000 });

export const showError = (message: string) =>
    toast.error(message, { duration: 5000 });

export const showInfo = (message: string) =>
    toast(message, { duration: 3000, icon: 'ℹ️' });
