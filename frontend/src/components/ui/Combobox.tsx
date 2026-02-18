import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useState, useMemo } from 'react';
import { cn } from '@/utils';

interface ComboboxProps<T> {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    label?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function ComboboxSelect<T extends string | number>({
    value,
    onChange,
    options,
    label,
    error,
    placeholder = 'Select option',
    disabled = false,
}: ComboboxProps<T>) {
    const [query, setQuery] = useState('');

    const filteredOptions = query === ''
        ? options
        : options.filter((opt) =>
            opt.label
                .toLowerCase()
                .replace(/\s+/g, '')
                .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

    return (
        <div className={cn("w-full", disabled && "opacity-50 pointer-events-none")}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <Combobox
                value={value}
                onChange={(val) => {
                    if (val !== null) onChange(val);
                }}
                disabled={disabled}
                onClose={() => setQuery('')}
            >
                <div className="relative mt-1">
                    <div className={cn(
                        "relative w-full cursor-default overflow-hidden rounded-lg border bg-white text-left shadow-sm focus:outline-none sm:text-sm",
                        error
                            ? "border-red-300 focus-within:ring-2 focus-within:ring-red-500/30 focus-within:border-red-500"
                            : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500"
                    )}>
                        <ComboboxInput
                            className={cn(
                                "w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0",
                                "placeholder:text-gray-400"
                            )}
                            displayValue={(val: T) => options.find(opt => opt.value === val)?.label || ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400 hover:text-gray-500"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredOptions.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Nothing found.
                                </div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <ComboboxOption
                                        key={opt.value}
                                        className={({ focus }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${focus ? 'bg-blue-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={opt.value}
                                    >
                                        {({ selected, focus }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${focus ? 'text-white' : 'text-blue-600'
                                                            }`}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))
                            )}
                        </ComboboxOptions>
                    </Transition>
                </div>
            </Combobox>
            {error && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
