import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Select, ComboboxSelect } from '@/components/ui';
import { useMarkAttendance, useEmployeesDropdown } from './useAttendance';

const today = () => new Date().toISOString().split('T')[0]!;

const schema = z
    .object({
        employee_id: z.string().min(1, 'Employee is required'),
        date: z
            .string()
            .min(1, 'Date is required')
            .refine(
                (d) => new Date(d) <= new Date(),
                'Date cannot be in the future',
            ),
        status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'], {
            required_error: 'Status is required',
        }),
        check_in: z.string().optional().or(z.literal('')),
        check_out: z.string().optional().or(z.literal('')),
        notes: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
    })
    .refine(
        (data) => {
            if (data.check_in && data.check_out) {
                return data.check_out > data.check_in;
            }
            return true;
        },
        { message: 'Check-out must be after check-in', path: ['check_out'] },
    );

type FormData = z.infer<typeof schema>;

interface MarkAttendanceFormProps {
    open: boolean;
    onClose: () => void;
}

const statusOptions = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'HALF_DAY', label: 'Half Day' },
    { value: 'ON_LEAVE', label: 'On Leave' },
];

export function MarkAttendanceForm({ open, onClose }: MarkAttendanceFormProps) {
    const { data: employees = [], isLoading: loadingEmployees } = useEmployeesDropdown();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { date: today(), status: 'PRESENT', employee_id: '' },
    });

    const mutation = useMarkAttendance(() => {
        reset({ date: today(), status: 'PRESENT', employee_id: '' });
        onClose();
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate({
            employee_id: data.employee_id,
            date: data.date,
            status: data.status,
            check_in: data.check_in || null,
            check_out: data.check_out || null,
            notes: data.notes || null,
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Mark Attendance">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                    name="employee_id"
                    control={control}
                    render={({ field }) => (
                        <ComboboxSelect
                            label="Employee"
                            placeholder={loadingEmployees ? 'Loading employees...' : 'Select employee'}
                            options={employees}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.employee_id?.message}
                            disabled={loadingEmployees}
                        />
                    )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="date"
                        label="Date"
                        type="date"
                        max={today()}
                        error={errors.date?.message}
                        {...register('date')}
                    />
                    <Select
                        id="status"
                        label="Status"
                        options={statusOptions}
                        error={errors.status?.message}
                        {...register('status')}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="check_in"
                        label="Check-in"
                        type="time"
                        error={errors.check_in?.message}
                        {...register('check_in')}
                    />
                    <Input
                        id="check_out"
                        label="Check-out"
                        type="time"
                        error={errors.check_out?.message}
                        {...register('check_out')}
                    />
                </div>
                <Input
                    id="notes"
                    label="Notes"
                    placeholder="Optional notes..."
                    error={errors.notes?.message}
                    {...register('notes')}
                />

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
                        Mark Attendance
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
