import { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import Table from '#components/Table';
import {
    createStringColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import Link from '#components/Link';
import type { paths } from '#generated/riskTypes';
import { resolveToComponent } from '#utils/translation';

import useTranslation from '#hooks/useTranslation';
import { minSafe } from '#utils/common';
import {
    getDataWithTruthyHazardType,
    getDisplacementForSelectedMonths,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hasSomeDefinedValue,
} from '#utils/risk';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
// FIXME: query type not available
// type CountryRiskQuery = GetCountryRisk['parameters']['query'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

interface Props {
    className?: string;
    riskData: RiskData | undefined;
    selectedMonths: Record<number, boolean> | undefined;
    dataPending: boolean;
}

function RiskTable(props: Props) {
    const {
        riskData,
        className,
        selectedMonths,
        dataPending,
    } = props;

    const strings = useTranslation(i18n);

    const fiData = useMemo(
        () => getFiRiskDataItem(riskData?.ipc_displacement_data),
        [riskData],
    );

    const wfData = useMemo(
        () => getWfRiskDataItem(riskData?.gwis),
        [riskData],
    );

    const hazardTypeList = useMemo(
        () => (
            unique(
                [
                    ...riskData?.idmc?.filter(hasSomeDefinedValue) ?? [],
                    ...riskData?.raster_displacement_data?.filter(hasSomeDefinedValue) ?? [],
                    ...riskData?.inform_seasonal?.filter(hasSomeDefinedValue) ?? [],
                    fiData,
                    wfData,
                ].filter(isDefined).map(getDataWithTruthyHazardType).filter(isDefined),
                (data) => data.hazard_type,
            ).map((combinedData) => ({
                hazard_type: combinedData.hazard_type,
                hazard_type_display: combinedData.hazard_type_display,
            }))
        ),
        [riskData, fiData, wfData],
    );

    type HazardTypeOption = (typeof hazardTypeList)[number];

    const riskScoreToCategory = useCallback(
        (score: number | undefined | null, hazardType: HazardTypeOption['hazard_type']) => {
            if (isNotDefined(score) || score < 0) {
                return '-';
            }

            const scoreCategories = hazardType === 'WF' ? [
                { score: 1000, label: strings.riskScoreVeryHighLabel },
                { score: 17, label: strings.riskScoreHighLabel },
                { score: 9, label: strings.riskScoreMediumLabel },
                { score: 5, label: strings.riskScoreLowLabel },
                { score: 2, label: strings.riskScoreVeryLowLabel },
            ] : [
                { score: 10, label: strings.riskScoreVeryHighLabel },
                { score: 6.5, label: strings.riskScoreHighLabel },
                { score: 5, label: strings.riskScoreMediumLabel },
                { score: 3.5, label: strings.riskScoreLowLabel },
                { score: 2, label: strings.riskScoreVeryLowLabel },
            ];

            const currentCategory = scoreCategories.reverse().filter(
                (category) => score <= category.score,
            );

            if (currentCategory.length === 0) {
                return strings.riskScoreNotApplicableLabel;
            }

            return currentCategory[0].label;
        },
        [strings],
    );

    const displacementRiskData = useMemo(
        () => listToMap(
            riskData?.idmc?.map(getDataWithTruthyHazardType).filter(isDefined) ?? [],
            (data) => data.hazard_type,
        ),
        [riskData],
    );

    const exposureRiskData = useMemo(
        () => ({
            ...listToMap(
                riskData?.raster_displacement_data?.map(
                    getDataWithTruthyHazardType,
                ).filter(isDefined) ?? [],
                (data) => data.hazard_type,
            ),
            FI: fiData,
        }),
        [riskData, fiData],
    );

    const informSeasonalRiskData = useMemo(
        () => ({
            ...listToMap(
                riskData?.inform_seasonal?.map(getDataWithTruthyHazardType).filter(isDefined) ?? [],
                (data) => data.hazard_type,
            ),
            WF: wfData,
        }),
        [wfData, riskData],
    );

    const riskTableColumns = useMemo(
        () => ([
            createStringColumn<HazardTypeOption, string>(
                'hazard_type',
                strings.riskTableHazardTypeTitle,
                (item) => item.hazard_type_display,
            ),
            createStringColumn<HazardTypeOption, string>(
                'riskScore',
                strings.riskTableInformTitle,
                (option) => riskScoreToCategory(
                    getDisplacementForSelectedMonths(
                        selectedMonths,
                        informSeasonalRiskData[option.hazard_type],
                        'max',
                    ),
                    option.hazard_type,
                ),
                {
                    headerInfoTitle: strings.riskTableInformTitle,
                    headerInfoDescription: (
                        <div className={styles.informDescription}>
                            <div>
                                {strings.riskTableInformDescriptionP1}
                            </div>
                            <div>
                                {strings.riskTableInformDescriptionP2}
                            </div>
                            <div>
                                {resolveToComponent(
                                    strings.riskTableInformDescriptionP3,
                                    {
                                        moreInfoLink: (
                                            <Link to="https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Covid-19/INFORM-Covid-19-Warning-beta-version">
                                                {strings.riskTableInformDescriptionHereLabel}
                                            </Link>
                                        ),
                                    },
                                )}
                            </div>
                        </div>
                    ),
                },
            ),
            createNumberColumn<HazardTypeOption, string>(
                'exposure',
                strings.riskTablePeopleExposedTitle,
                (option) => getDisplacementForSelectedMonths(
                    selectedMonths,
                    exposureRiskData[option.hazard_type],
                ),
                {
                    headerInfoTitle: strings.riskTablePeopleExposedTitle,
                    headerInfoDescription: strings.riskTablePeopleExposedDescription,
                    maximumFractionDigits: 0,
                },
            ),
            createNumberColumn<HazardTypeOption, string>(
                'displacement',
                strings.riskTableDisplacementTitle,
                (option) => {
                    const exposure = getDisplacementForSelectedMonths(
                        selectedMonths,
                        exposureRiskData[option.hazard_type],
                    );

                    const displacement = getDisplacementForSelectedMonths(
                        selectedMonths,
                        displacementRiskData[option.hazard_type],
                    );

                    if (isNotDefined(displacement)) {
                        return undefined;
                    }

                    return minSafe([exposure, displacement]);
                },
                {
                    headerInfoTitle: strings.riskTableDisplacementTitle,
                    headerInfoDescription: strings.riskTableDisplacementDescription,
                    maximumFractionDigits: 0,
                },
            ),
        ]),
        [
            displacementRiskData,
            exposureRiskData,
            informSeasonalRiskData,
            strings,
            riskScoreToCategory,
            selectedMonths,
        ],
    );

    return (
        <Table
            filtered={false}
            pending={dataPending}
            className={_cs(styles.riskTable, className)}
            data={hazardTypeList}
            columns={riskTableColumns}
            keySelector={(d: HazardTypeOption) => d.hazard_type}
        />
    );
}

export default RiskTable;
