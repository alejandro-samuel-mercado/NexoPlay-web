'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    id: string;
    name: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    showClearOption?: boolean;
    clearOptionLabel?: string;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    className = '',
    buttonClassName = 'bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]',
    showClearOption = false,
    clearOptionLabel = 'Todos'
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 px-5 py-2.5 rounded-full text-sm font-bold transition-all outline-none w-full ${buttonClassName}`}
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedOption?.icon}
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''} ${buttonClassName.includes('text-black') ? 'text-black/70' : 'text-[var(--text-muted)]'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-max bg-[var(--bg-panel)]/95 border border-[var(--border-subtle)] rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-xl max-h-80 overflow-y-auto hide-scrollbar">
                    {showClearOption && (
                        <button
                            onClick={() => {
                                onChange(null);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors ${!value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-main)] hover:bg-[var(--bg-hover)]'}`}
                        >
                            <span>{clearOptionLabel}</span>
                            {!value && <Check size={16} />}
                        </button>
                    )}
                    
                    {options.map((option) => (
                        <button 
                            key={option.id}
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors ${option.id === value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-main)] hover:bg-[var(--bg-hover)]'}`}
                        >
                            <span className="flex items-center gap-3">
                                {option.icon && <span className={option.id === value ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}>{option.icon}</span>}
                                {option.name}
                            </span>
                            {option.id === value && <Check size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
