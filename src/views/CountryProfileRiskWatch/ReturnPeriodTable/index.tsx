import { useMemo } from 'react';
import { isDefined, isFalsyString, unique } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import {
    createStringColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import type { paths, components } from '#generated/riskTypes';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type HazardType = components<'read'>['schemas']['HazardTypeEnum'];
interface HazardTypeOption {
    hazard_type: HazardType;
    hazard_type_display: string;
}
interface TransformedReturnPeriodData {
    frequencyDisplay: string;
    displacement: number | undefined;
    exposure: number | undefined;
    economicLosses: number | undefined;
}

function hazardTypeKeySelector(option: HazardTypeOption) {
    return option.hazard_type;
}
function hazardTypeLabelSelector(option: HazardTypeOption) {
    return option.hazard_type_display;
}
function returnPeriodKeySelector(option: TransformedReturnPeriodData) {
    return option.frequencyDisplay;
}

interface Props {
    data: CountryRiskResponse[number]['return_period_data'] | undefined;
}

function ReturnPeriodTable(props: Props) {
    const { data } = props;
    const strings = useTranslation(i18n);

    const [hazardType, setHazardType] = useInputState<HazardType>('FL');
    const hazardOptions = useMemo(
        () => (
            unique(
                data?.map(
                    (datum) => {
                        if (isFalsyString(datum.hazard_type)) {
                            return undefined;
                        }

                        return {
                            hazard_type: datum.hazard_type,
                            hazard_type_display: datum.hazard_type_display,
                        };
                    },
                ).filter(isDefined) ?? [],
                (datum) => datum.hazard_type_display,
            )
        ),
        [data],
    );

    const columns = useMemo(
        () => ([
            createStringColumn<TransformedReturnPeriodData, string | number>(
                'frequency',
                strings.returnPeriodTableReturnPeriodTitle,
                (item) => item.frequencyDisplay,
            ),
            createNumberColumn<TransformedReturnPeriodData, string | number>(
                'numRiskOfDisplacement',
                strings.returnPeriodTableDisplacementTitle,
                (item) => item.displacement,
                {
                    headerInfoTitle: strings.returnPeriodTableDisplacementTitle,
                    headerInfoDescription: resolveToComponent(
                        strings.returnPeriodTableDisplacementDescription,
                        {
                            source: (
                                <Link
                                    href="https://www.internal-displacement.org/database/global-displacement-risk-model"
                                    external
                                >
                                    {strings.returnPeriodTableDisplacementSource}
                                </Link>
                            ),
                        },
                    ),
                    maximumFractionDigits: 0,
                },
            ),
            createNumberColumn<TransformedReturnPeriodData, string | number>(
                'economicLosses',
                strings.returnPeriodTableEconomicLossesTitle,
                (item) => item.economicLosses,
                {
                    headerInfoTitle: strings.returnPeriodTableEconomicLossesTitle,
                    headerInfoDescription: resolveToComponent(
                        strings.returnPeriodTableEconomicLossesDescription,
                        {
                            source: (
                                <Link
                                    href="https://www.gfdrr.org/en/disaster-risk-country-profiles"
                                    external
                                >
                                    {strings.returnPeriodTableEconomicLossesSource}
                                </Link>
                            ),
                        },
                    ),
                },
            ),
        ]),
        [
            strings.returnPeriodTableReturnPeriodTitle,
            strings.returnPeriodTableEconomicLossesTitle,
            strings.returnPeriodTableEconomicLossesDescription,
            strings.returnPeriodTableDisplacementDescription,
            strings.returnPeriodTableDisplacementSource,
            strings.returnPeriodTableEconomicLossesSource,
            strings.returnPeriodTableDisplacementTitle,
        ],
    );

    const transformedReturnPeriods = useMemo<TransformedReturnPeriodData[]>(
        () => {
            const value = data?.find(
                (d) => d.hazard_type === hazardType,
            );

            return [
                {
                    frequencyDisplay: '1-in-20-year event',
                    displacement: value?.twenty_years?.population_displacement,
                    economicLosses: value?.twenty_years?.economic_loss,
                    exposure: value?.twenty_years?.economic_loss,
                },
                {
                    frequencyDisplay: '1-in-50-year event',
                    displacement: value?.fifty_years?.population_displacement,
                    economicLosses: value?.fifty_years?.economic_loss,
                    exposure: value?.fifty_years?.population_exposure,
                },
                {
                    frequencyDisplay: '1-in-100-year event',
                    displacement: value?.hundred_years?.population_displacement,
                    economicLosses: value?.hundred_years?.economic_loss,
                    exposure: value?.hundred_years?.population_exposure,
                },
                {
                    frequencyDisplay: '1-in-250-year event',
                    displacement: value?.two_hundred_fifty_years?.population_displacement,
                    economicLosses: value?.two_hundred_fifty_years?.economic_loss,
                    exposure: value?.two_hundred_fifty_years?.population_exposure,
                },
                {
                    frequencyDisplay: '1-in-500-year event',
                    displacement: value?.five_hundred_years?.population_displacement,
                    economicLosses: value?.five_hundred_years?.economic_loss,
                    exposure: value?.five_hundred_years?.population_exposure,
                },
            ];
        },
        [data, hazardType],
    );

    return (
        <Container
            className={styles.returnPeriodTable}
            heading={strings.returnPeriodTableHeading}
            filtersContainerClassName={styles.filters}
            withHeaderBorder
            filters={(
                <SelectInput
                    name={undefined}
                    options={hazardOptions}
                    keySelector={hazardTypeKeySelector}
                    labelSelector={hazardTypeLabelSelector}
                    value={hazardType}
                    onChange={setHazardType}
                    nonClearable
                />
            )}
        >
            <Table
                filtered={false}
                pending={false}
                className={styles.returnPeriodTable}
                data={transformedReturnPeriods}
                columns={columns}
                keySelector={returnPeriodKeySelector}
            />
        </Container>
    );
}

export default ReturnPeriodTable;
