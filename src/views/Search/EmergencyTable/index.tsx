import { generatePath } from 'react-router-dom';
import { useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import {
    createNumberColumn,
    createStringColumn,
    createLinkColumn,
    createProgressColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface EmergencyResult {
    id: number;
    disaster_type: string;
    funding_requirements: string;
    name: string;
    funding_coverage: string;
    start_date: string;
    score: number;
    countries: string[];
    countries_id: number[];
    iso3: string[];
    appeal_type: string;
    crisis_categorization: CrisisType;
}

function emergencyKeySelector(emergency: EmergencyResult) {
    return emergency.id;
}

type CrisisType = 'Red' | 'Yellow' | 'Orange';

// TODO: use this values from css
const crisisTypeColorMap: Record<CrisisType, string> = {
    Yellow: '#ff9e00',
    Orange: '#ff6b00',
    Red: '#de2934',
};

interface Props {
    className?: string;
    data: EmergencyResult[] | undefined;
    actions: React.ReactNode;
}

function EmergencyTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const columns = useMemo(() => ([
        createLinkColumn<EmergencyResult, number>(
            'title',
            strings.searchEmergencyTableTitle,
            (emergency) => emergency.name,
            (emergency) => ({
                to: generatePath(
                    emergencyRoute.absolutePath,
                    { emergencyId: String(emergency.id) },
                ),
                // TODO: create a separate component for dot
                icons: (
                    <span
                        title={emergency.crisis_categorization}
                        className={styles.dotColor}
                        style={{
                            backgroundColor: crisisTypeColorMap[
                                emergency.crisis_categorization
                            ],
                        }}
                    />
                ),
            }),
        ),
        createStringColumn<EmergencyResult, number>(
            'appeal_type',
            strings.searchEmergencyTableAppealType,
            (emergency) => emergency.appeal_type ?? '-',
        ),
        createStringColumn<EmergencyResult, number>(
            'disaster_type',
            strings.searchEmergencyTableDisasterType,
            (emergency) => emergency.disaster_type,
        ),
        createNumberColumn<EmergencyResult, number>(
            'funding_requirements',
            strings.searchEmergencyTableFundingRequirements,
            (emergency) => Number(emergency.funding_requirements),
            {
                unit: ' CHF',
            },
        ),
        createProgressColumn<EmergencyResult, number>(
            'funding_coverage',
            strings.searchEmergencyTableFundingCoverage,
            (emergency) => 100 * (
                Number(emergency.funding_coverage) / Number(emergency.funding_requirements)
            ),
        ),
        createCountryListColumn<EmergencyResult, number>(
            'countries',
            strings.searchEmergencyTableCountry,
            (item) => item.countries_id.map(
                (countryId, index) => ({
                    id: countryId,
                    name: item.countries[index],
                }),
            ),
            countryRoute.absolutePath,
        ),
    ]), [strings, countryRoute, emergencyRoute]);

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.emergencyTable, className)}
            heading={strings.searchIfrcEmergencies}
            childrenContainerClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={data}
                columns={columns}
                keySelector={emergencyKeySelector}
            />
        </Container>
    );
}

export default EmergencyTable;
