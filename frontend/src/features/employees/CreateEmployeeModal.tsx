import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '@/components/ui';
import { useCreateEmployee } from './useEmployees';

const schema = z.object({
    employee_code: z
        .string()
        .min(1, 'Employee code is required')
        .max(20, 'Max 20 characters')
        .regex(/^\S*$/, 'Employee code cannot contain spaces'),
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email')
        .max(255, 'Max 255 characters'),
    department: z
        .string()
        .min(1, 'Department is required')
        .max(100, 'Max 100 characters'),
    designation: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
    date_of_joining: z.string().min(1, 'Date of joining is required'),
    phone: z.string().max(20, 'Max 20 characters').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface CreateEmployeeModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreateEmployeeModal({ open, onClose }: CreateEmployeeModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const mutation = useCreateEmployee(() => {
        reset();
        onClose();
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate({
            employee_code: data.employee_code,
            name: data.name,
            email: data.email,
            department: data.department,
            designation: data.designation || null,
            date_of_joining: data.date_of_joining,
            phone: data.phone || null,
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Add Employee">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="employee_code"
                        label="Employee Code"
                        placeholder="EMP-001"
                        error={errors.employee_code?.message}
                        {...register('employee_code')}
                    />
                    <Input
                        id="name"
                        label="Full Name"
                        placeholder="John Doe"
                        error={errors.name?.message}
                        {...register('name')}
                    />
                </div>
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="john@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="department"
                        label="Department"
                        placeholder="Engineering"
                        error={errors.department?.message}
                        {...register('department')}
                    />
                    <Input
                        id="designation"
                        label="Designation"
                        placeholder="Software Engineer"
                        error={errors.designation?.message}
                        {...register('designation')}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="date_of_joining"
                        label="Date of Joining"
                        type="date"
                        error={errors.date_of_joining?.message}
                        {...register('date_of_joining')}
                    />
                    <Input
                        id="phone"
                        label="Phone"
                        placeholder="+91 9876543210"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        Create Employee
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
