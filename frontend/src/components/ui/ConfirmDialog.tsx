import { Fragment } from 'react';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Delete',
    confirmVariant = 'destructive',
    isLoading = false,
}: ConfirmDialogProps & { confirmVariant?: 'primary' | 'secondary' | 'destructive' }) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 translate-y-4 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:scale-95"
                        >
                            <DialogPanel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base font-semibold text-gray-900">
                                            {title}
                                        </DialogTitle>
                                        <p className="mt-2 text-sm text-gray-500">{message}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant={confirmVariant}
                                        size="sm"
                                        onClick={onConfirm}
                                        isLoading={isLoading}
                                    >
                                        {confirmLabel}
                                    </Button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
