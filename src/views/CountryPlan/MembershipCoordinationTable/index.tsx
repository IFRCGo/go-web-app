import { useMemo } from 'react';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    listToGroupList,
    listToMap,
    mapToList,
    unique,
} from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Table from '#components/Table';
import { createElementColumn, createStringColumn } from '#components/Table/ColumnShortcuts';
import { paths } from '#generated/types';
import { numericKeySelector } from '#utils/selectors';

import i18n from '../i18n.json';
import styles from './styles.module.css';

type GetCountryPlan = paths['/api/v2/country-plan/{country}/']['get'];
type GetCountryPlanResponse = GetCountryPlan['responses']['200']['content']['application/json'];

interface IconProps {
    shouldShow: boolean;
}

function Icon(props: IconProps) {
    const { shouldShow } = props;

    if (!shouldShow) {
        return null;
    }

    return <CheckboxCircleLineIcon className={styles.icon} />;
}

interface Props {
    className?: string;
    membershipData: GetCountryPlanResponse['membership_coordinations'] | undefined;
}

function MembershipCoordinationTable(props: Props) {
    const {
        className,
        membershipData,
    } = props;

    const strings = useTranslation(i18n);

    const tableData = useMemo(
        () => {
            if (!membershipData) {
                return undefined;
            }

            const membershipWithUniqueSectors = unique(
                membershipData,
                (membership) => membership.sector,
            );

            const nationalSocieties = mapToList(
                listToGroupList(
                    // NOTE: entries with null ids are included
                    // to include all the sectors so we can ignore
                    // them here
                    membershipData.filter(
                        (membership) => isDefined(membership.id),
                    ),
                    (membership) => membership.national_society,
                ),
                (membershipList, key) => ({
                    key: Number(key),
                    national_society: membershipList[0].national_society,
                    national_society_name: membershipList[0].national_society_name,
                    sectors: listToMap(
                        membershipList,
                        (membership) => membership.sector,
                        () => true,
                    ),
                }),
            );

            type NationalSocietyElement = (typeof nationalSocieties)[number];
            const columns = [
                createStringColumn<NationalSocietyElement, number>(
                    'national_society_name',
                    strings.countryPlanNameOfPNS,
                    (item) => item.national_society_name,
                ),
                ...membershipWithUniqueSectors.map(
                    (membership) => (
                        createElementColumn<NationalSocietyElement, number, IconProps>(
                            membership.sector,
                            membership.sector_display,
                            Icon,
                            (_, item) => ({
                                shouldShow: item.sectors[membership.sector] ?? false,
                            }),
                            { headerCellRendererClassName: styles.sectorHeading },
                        )
                    ),
                ),
            ];

            return {
                membershipWithUniqueSectors,
                nationalSocieties,
                columns,
            };
        },
        [strings, membershipData],
    );

    if (!tableData) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.membershipCoordinationTable, className)}
            heading={strings.countryPlanMembershipCoordinationTableTitle}
            withHeaderBorder
        >
            <Table
                pending={false}
                filtered={false}
                className={styles.membershipCoordinationTable}
                data={tableData.nationalSocieties}
                columns={tableData.columns}
                keySelector={numericKeySelector}
            />
        </Container>
    );
}

export default MembershipCoordinationTable;
