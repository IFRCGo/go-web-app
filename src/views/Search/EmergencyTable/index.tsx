import React, { useMemo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import { round } from '#utils/common';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Table, { Column as TableColumn } from '#components/Table';
import TableHeaderCell, { HeaderCellProps as TableHeaderCellProps } from '#components/Table/HeaderCell';
import ProgressBar from '#components/ProgressBar';
import Link from '#components/Link';
import ReducedListDisplay from '#components/ReducedListDisplay';
import {
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';

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

const crisisTypeColorMap: Record<CrisisType, string> = {
    Yellow: '#ff9e00',
    Orange: '#ff6b00',
    Red: '#de2934',
};

interface EmergencyTitleRenderProps {
    crisisType: CrisisType;
    emergencyId: number;
    emergencyTitle: string;
}

function EmergencyTitleRender(props: EmergencyTitleRenderProps) {
    const {
        crisisType,
        emergencyId,
        emergencyTitle,
    } = props;

    console.log('crisis', crisisType, emergencyId);

    const color = crisisTypeColorMap[crisisType];

    return (
        <Link
            to={`/emergencies/${emergencyId}`}
            className={styles.crisisType}
            underline
        >
            <span
                title={crisisType}
                className={styles.dotColor}
                style={{ backgroundColor: color }}
            />
            {emergencyTitle}
        </Link>
    );
}

interface ProgressBarColumnRenderProps {
    value: number;
    totalValue: number | undefined;
}

function ProgressBarColumnRender(props: ProgressBarColumnRenderProps) {
    const {
        value,
        totalValue,
    } = props;

    if (isDefined(value) && isDefined(totalValue) && totalValue > 0) {
        if (value <= totalValue) {
            const title = `${round((value / totalValue) * 100, 2).toString()}%`;
            return (
                <ProgressBar
                    title={title}
                    value={value}
                    totalValue={totalValue}
                />
            );
        }
        const title = '100%';
        return (
            <ProgressBar
                title={title}
                value={value}
                totalValue={100}
            />
        );
    }
    return (
        <>-</>
    );
}

interface CountryColumnRenderProps {
    emergency: EmergencyResult;
    title: string;
}

function CountryColumnRender(props: CountryColumnRenderProps) {
    const {
        emergency,
        title,
    } = props;

    if (emergency.countries.length > 1) {
        return (
            <ReducedListDisplay
                title={title}
                value={emergency.countries}
            />
        );
    }
    return (
        <Link
            to={`countries/${emergency.countries_id}`}
            className={styles.countryLink}
        >
            {emergency.countries[0]}
        </Link>
    );
}

interface Props {
    className?: string;
    data: EmergencyResult[] | undefined;
    actions: React.ReactNode;
    name?: string;
}

function EmergencyTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = useMemo(() => {
        const titleColumn: TableColumn<
            EmergencyResult, number, EmergencyTitleRenderProps, TableHeaderCellProps
        > = {
            id: 'name',
            title: strings.searchEmergencyTableTitle,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {},
            cellRenderer: EmergencyTitleRender,
            cellRendererParams: (_, data) => ({
                crisisType: data.crisis_categorization,
                emergencyId: data.id,
                emergencyTitle: data.name,
            }),
        };

        // TODO: create a different column shortcut for progressbar column
        const fundingCoverageColumn: TableColumn<
            EmergencyResult, number, ProgressBarColumnRenderProps, TableHeaderCellProps
        > = {
            id: 'funding_coverage',
            title: strings.searchEmergencyTableFundingCoverage,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {},
            cellRenderer: ProgressBarColumnRender,
            cellRendererParams: (_, data) => ({
                value: +data.funding_requirements,
                totalValue: +data.funding_coverage,
            }),
        };

        const countryColumn: TableColumn<
            EmergencyResult, number, CountryColumnRenderProps, TableHeaderCellProps
        > = {
            id: 'countries',
            title: strings.searchEmergencyTableCountry,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {},
            cellRenderer: CountryColumnRender,
            cellRendererParams: (_, data) => ({
                title: strings.searchEmergencyTableMultipleCountries,
                emergency: data,
            }),
        };

        return ([
            titleColumn,
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
                (emergency) => +emergency.funding_requirements ?? '-',
                {
                    suffix: (
                        <span>
                            &nbsp;
                            CHF
                        </span>
                    ),
                    precision: 0,
                },
            ),
            fundingCoverageColumn,
            countryColumn,
        ]);
    }, [
    ]);

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
                // variant="large"
            />
        </Container>
    );
}

export default EmergencyTable;
