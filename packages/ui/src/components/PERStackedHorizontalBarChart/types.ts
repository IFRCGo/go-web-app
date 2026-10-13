export interface DataItem {
    /** Identifies the row */
    name: string;
    /** Text shown to the user. Falls back to `name` */
    displayName?: string;
    SelfAssessment?: number;
    Simulation?: number;
    Operational?: number;
    PostOperational?: number;
    [key: string]: DataItem[keyof DataItem] | string | number;
}

export interface Props {
    data: DataItem[];
    transitionSpeed?: number;
    maxValue?: number | null;
    tooltipFormat?: (label: string, value: number) => string;
    tooltipEnabled?: boolean;
}
