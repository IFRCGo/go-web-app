import { useMemo } from 'react';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    unique,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

type EmergencyProjectResponse = GoApiResponse<'/api/v2/emergency-project/'>
type EmergencyProject = NonNullable<EmergencyProjectResponse['results']>[number];
type EmergencyProjectActivity = NonNullable<NonNullable<EmergencyProjectResponse['results']>[number]['activities']>[number];
type SectorDetails = NonNullable<EmergencyProject['activities']>[number]['sector_details'];
type SectorCount = { id: number, title: string, count: number }

export function getPeopleReachedInActivity(activity: EmergencyProjectActivity) {
    const {
        is_simplified_report,

        people_count,
        male_0_1_count,
        male_2_5_count,
        male_6_12_count,
        male_13_17_count,
        male_18_59_count,
        male_60_plus_count,
        male_unknown_age_count,

        female_0_1_count,
        female_2_5_count,
        female_6_12_count,
        female_13_17_count,
        female_18_59_count,
        female_60_plus_count,
        female_unknown_age_count,

        other_0_1_count,
        other_2_5_count,
        other_6_12_count,
        other_13_17_count,
        other_18_59_count,
        other_60_plus_count,
        other_unknown_age_count,
    } = activity;

    if (is_simplified_report === true) {
        return people_count ?? 0;
    }

    if (is_simplified_report === false) {
        return sumSafe([
            male_0_1_count,
            male_2_5_count,
            male_6_12_count,
            male_13_17_count,
            male_18_59_count,
            male_60_plus_count,
            male_unknown_age_count,

            female_0_1_count,
            female_2_5_count,
            female_6_12_count,
            female_13_17_count,
            female_18_59_count,
            female_60_plus_count,
            female_unknown_age_count,

            other_0_1_count,
            other_2_5_count,
            other_6_12_count,
            other_13_17_count,
            other_18_59_count,
            other_60_plus_count,
            other_unknown_age_count,
        ]);
    }

    return undefined;
}

export function getPeopleReached(project: EmergencyProject) {
    const peopleReached = sumSafe(project.activities?.map(getPeopleReachedInActivity));

    return peopleReached;
}

function useEmergencyProjectStats(
    projectList: EmergencyProject[] = [],
    filteredProjectList: EmergencyProject[] = [],
) {
    const stats = useMemo(() => {
        const eruList = unique(
            projectList?.map((p) => (p.activity_lead === 'deployed_eru' ? p.deployed_eru : undefined))
                .filter(isDefined),
        );

        const nsList = unique(
            projectList?.map((p) => (p.activity_lead === 'national_society' ? p.reporting_ns : undefined))
                .filter(isDefined),
        );

        const sectors = unique(
            projectList?.map((p) => p.activities?.map((a) => a.sector))
                .flat(1)
                .filter(isDefined),
        );

        const sectorList = projectList
            ?.flatMap((project) => unique(
                project.activities?.map((activity) => activity.sector_details) ?? [],
                (activity) => activity.id,
            ));

        const emergencyProjectCountListBySector = Object.values(
            sectorList.reduce((acc, val) => {
                const newAcc = { ...acc };
                if (!acc[val.id]) {
                    newAcc[val.id] = {
                        id: val.id,
                        title: val.title,
                        count: 1,
                    };
                } else {
                    newAcc[val.id] = {
                        ...newAcc[val.id],
                        count: newAcc[val.id].count + 1,
                    };
                }

                return newAcc;
            }, {} as Record<number, SectorCount>),
        );

        const projectCountByStatus = projectList.map((p) => p.status_display).reduce(
            (acc, val) => {
                const newAcc = { ...acc };
                if (!newAcc[val]) {
                    newAcc[val] = { title: val, count: 1 };
                } else {
                    newAcc[val] = {
                        ...newAcc[val],
                        count: newAcc[val].count + 1,
                    };
                }

                return newAcc;
            },
            {} as Record<string, { title: string, count: number }>,
        );

        const districtList = filteredProjectList?.flatMap(
            (p) => p.districts_details.map((d) => d.id),
        ) ?? [];
        const emergencyProjectCountByDistrict = districtList.reduce((acc, val) => {
            const newAcc = { ...acc };
            if (!newAcc[val]) {
                newAcc[val] = 0;
            }

            newAcc[val] += 1;
            return newAcc;
        }, {} as Record<number, number>);

        const sectorGroupedEmergencyProjects = filteredProjectList.reduce((acc, val) => {
            const newAcc = { ...acc };
            val.activities?.forEach((activity) => {
                if (!newAcc[activity.sector]) {
                    newAcc[activity.sector] = {
                        sectorDetails: activity.sector_details,
                        projects: [],
                    };
                }

                const projectIndex = newAcc[activity.sector].projects
                    .findIndex((d) => d.id === val.id);

                if (projectIndex === -1) {
                    newAcc[activity.sector].projects.push(val);
                }
            });

            return newAcc;
        }, {} as Record<
            number, {
                sectorDetails: SectorDetails;
                projects: EmergencyProject[];
            }>);

        const peopleReached = sumSafe(projectList.map((p) => getPeopleReached(p)));

        return {
            emergencyProjectCountByDistrict,
            emergencyProjectCountListBySector,
            emergencyProjectCountListByStatus: Object.values(projectCountByStatus),
            peopleReached,
            sectorGroupedEmergencyProjects,
            uniqueEruCount: eruList?.length ?? 0,
            uniqueNsCount: nsList?.length ?? 0,
            uniqueSectorCount: sectors?.length ?? 0,
        };
    }, [projectList, filteredProjectList]);

    return stats;
}

export default useEmergencyProjectStats;
