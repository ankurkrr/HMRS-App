/* ------------------------------------------------------------------ */
/*  Domain types — UI-layer shapes that may diverge from API later     */
/* ------------------------------------------------------------------ */

export type { AttendanceStatus } from './api.types';

/** Navigation item for sidebar */
export interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/** Select option used across dropdowns */
export interface SelectOption {
    value: string;
    label: string;
}
