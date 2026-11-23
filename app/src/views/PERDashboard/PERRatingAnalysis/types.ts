interface PERRatingData {
    name: string;
    rating: number;
    change: number;
    changeDirection: 'up' | 'down';
    cycleRatings: CycleRating[];
    areaColor?: string;
}

interface PERAreaData extends PERRatingData {
    type: 'area';
}

interface PERComponentData extends PERRatingData {
    type: 'component';
    /** The component number */
    id: number;
    /** The letter of a sub-component, e.g. "A" for 14 A */
    letter: string | null;
    key: string;
}

export interface CycleRating {
    cycle: string;
    rating: number;
}

export interface Props {
    overallRating: {
        rating: number;
        change: number;
        changeDirection: 'up' | 'down';
        cycleRatings: CycleRating[];
    };
    areaData: PERAreaData[];
    componentData: PERComponentData[];
    className?: string;
}
