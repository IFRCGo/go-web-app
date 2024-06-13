import {
    useCallback,
    useMemo,
} from 'react';
import { Table } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
    DEFAULT_INVALID_TEXT,
    minSafe,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    getValueForSelectedMonths,
    getWfRiskDataItem,
    hasSomeDefinedValue,
    riskScoreToCategory,
} from '#utils/domain/risk';
import { type RiskApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryRiskResponse = RiskApiResponse<'/api/v1/country-seasonal/'>;
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
                return DEFAULT_INVALID_TEXT;
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
        [
            strings.riskScoreNotApplicableLabel,
            strings.riskScoreVeryHighLabel,
            strings.riskScoreMediumLabel,
            strings.riskScoreLowLabel,
            strings.riskScoreHighLabel,
            strings.riskScoreVeryLowLabel,
        ],
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
                    getValueForSelectedMonths(
                        selectedMonths,
                        informSeasonalRiskData[option.hazard_type],
                        'max',
                    ),
                    option.hazard_type,
                ),
                {
                    headerInfoTitle: strings.riskTableInformTitle,
                    // FIXME: add description for wildfire
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
                                            <Link
                                                href="https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Covid-19/INFORM-Covid-19-Warning-beta-version"
                                                external
                                            >
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
                (option) => getValueForSelectedMonths(
                    selectedMonths,
                    exposureRiskData[option.hazard_type],
                    option.hazard_type === 'FI' ? 'max' : 'sum',
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

                    const exposure = getValueForSelectedMonths(
                        selectedMonths,
                        exposureRiskData[option.hazard_type],
                    );

                    const displacement = getValueForSelectedMonths(
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
            strings.riskTableHazardTypeTitle,
            strings.riskTableInformTitle,
            strings.riskTableInformDescriptionP1,
            strings.riskTableInformDescriptionP2,
            strings.riskTableInformDescriptionP3,
            strings.riskTableInformDescriptionHereLabel,
            strings.riskTablePeopleExposedTitle,
            strings.riskTablePeopleExposedDescription,
            strings.riskTableDisplacementTitle,
            strings.riskTableDisplacementDescription,
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
