export type RatingStatus =
  | "Doesn't exist"
  | 'Partially exists'
  | 'Needs improvement'
  | 'Good performing'
  | 'High performing';

export interface PERRatingData {
    name: string;
    rating: number;
    status: RatingStatus;
    change: number;
    changeDirection: 'up' | 'down';
    cycleRatings: CycleRating[];
    areaColor?: string;
}

export interface PERAreaData extends PERRatingData {
    type: 'area';
}

export interface PERComponentData extends PERRatingData {
    type: 'component';
    id: number;
    key: string;
}

export interface CycleRating {
    cycle: string;
    rating: number;
    color: string;
}

export const COLORS = {
    primary: '#2264D1',
    policy: '#3B82F6',
    analysis: '#10B981',
    operational: '#F59E0B',
    support: '#8B5CF6',
    coordination: '#EC4899',
} as const;

export interface Props {
    overallRating: {
        rating: number;
        change: number;
        changeDirection: 'up' | 'down';
        status: RatingStatus;
        cycleRatings: CycleRating[];
        color: string;
    };
    areaData: PERAreaData[];
    componentData: PERComponentData[];
    className?: string;
}
