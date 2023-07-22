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
import useTranslation from '#hooks/useTranslation';
import { minSafe } from '#utils/common';
import {
    getDataWithTruthyHazardType,
    getDisplacementForSelectedMonths,
    getFiRiskDataItem,
    getWfRiskDataItem,
    hasSomeDefinedValue,
    riskScoreToCategory,
} from '#utils/risk';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import { resolveToComponent } from '#utils/translation';
import type { paths } from '#generated/riskTypes';

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

    const hazardKeySelector = useCallback(
        (d: HazardTypeOption) => d.hazard_type,
        [],
    );

    const riskScoreToLabel = useCallback(
        (score: number | undefined | null, hazardType: HazardTypeOption['hazard_type']) => {
            if (isNotDefined(score) || score < 0) {
                return '-';
            }

            const riskCategory = riskScoreToCategory(score, hazardType);

            if (isNotDefined(riskCategory)) {
                return strings.riskScoreNotApplicableLabel;
            }

            const riskCategoryToLabelMap = {
                [CATEGORY_RISK_VERY_HIGH]: strings.riskScoreVeryHighLabel,
                [CATEGORY_RISK_HIGH]: strings.riskScoreHighLabel,
                [CATEGORY_RISK_MEDIUM]: strings.riskScoreMediumLabel,
                [CATEGORY_RISK_LOW]: strings.riskScoreLowLabel,
                [CATEGORY_RISK_VERY_LOW]: strings.riskScoreVeryLowLabel,
            };

            return riskCategoryToLabelMap[riskCategory];
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
                (option) => riskScoreToLabel(
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
                    // NOTE: Naturally displacement should always be greater than
                    // or equal to the exposure. To follow that logic we reduce
                    // displacement value to show the exposure in case displacement
                    // is greater than exposure

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
            riskScoreToLabel,
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
            keySelector={hazardKeySelector}
        />
    );
}

export default RiskTable;
