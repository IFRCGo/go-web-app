import React from 'react';
import {
    PERConsiderations as PurePERConsiderations,
    PERConsiderationsProps,
} from '@ifrc-go/ui';

interface Props {
    data: {
        percentages: {
            epiPercentage: number;
            climatePercentage: number;
            urbanPercentage: number;
            migrationPercentage: number;
        };
        totals: {
            totalAssessments: number;
            totalEpiConsiderations: number;
            totalClimateConsiderations: number;
            totalUrbanConsiderations: number;
            totalMigrationConsiderations: number;
        };
        data: {
            name: string;
            SelfAssessment: number;
            Simulation: number;
            PostOperational: number;
            Operational: number;
        }[][];
    };
    activeIndex: string | number | null;
    onClick: (index: string) => void;
    onClickPER: (key: string) => void;
}

function PERConsiderations(props: Props) {
    return (
        <PurePERConsiderations {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

function StoryPERConsiderations(props: Props) {
    return (
        <PERConsiderations {...props} />
    );
}

export default StoryPERConsiderations;
