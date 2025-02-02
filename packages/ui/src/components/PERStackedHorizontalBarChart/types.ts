export interface DataItem {
    name: string;
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
