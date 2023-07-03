import { useMemo } from 'react';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import {
    _cs,
    isDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import { MembershipCoordination } from '#types/serverResponse';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Table from '#components/Table';
import { createStringColumn } from '#components/Table/ColumnShortcuts';

import i18n from '../i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    data: MembershipCoordination[] | undefined;
}

function memberCoordinationKeySelector(memberCoordination: MembershipCoordination) {
    return memberCoordination.id;
}

// eslint-disable-next-line import/prefer-default-export
function MemberCoordinationTable(props: Props) {
    const {
        className,
        data = [],
    } = props;

    const strings = useTranslation(i18n);

    const sectors = useMemo(
        () => (
            unique(
                data.map((d) => ({ key: d.sector, value: d.sector_display })),
                (d) => d.key,
            )
        ),
        [data],
    );

    const nsIdToNameMap = useMemo(
        () => (
            listToMap(
                unique(
                    data.filter((d) => isDefined(d.id)),
                    (d) => d.national_society,
                ),
                (d) => d.national_society,
                (d) => d.national_society_name,
            )
        ),
        [data],
    );

    const nsGroupedCoordination = useMemo(() => (
        listToGroupList(
            data.filter((d) => isDefined(d.id)),
            (d) => d.national_society,
            (d) => d.sector,
        )
    ), [data]);

    const nsGroupedCoordinationKeys = Object.keys(nsGroupedCoordination).map((d) => +d);

    const columns = useMemo(() => ([
        createStringColumn<MembershipCoordination, number>(
            'national_society_name',
            strings.countryPlanNameOfPNS,
            nsIdToNameMap,
        ),
        createStringColumn<MembershipCoordination, number>(
            '',
            strings.countryPageTitle,
            (mc) => {
                nsGroupedCoordinationKeys.map((ns) => {
                    const nsSectors = nsGroupedCoordination[ns];
                    const nsSectorMap = listToMap(nsSectors, (d) => d, () => true);

                    return (
                        <tr key={ns}>
                            <td>
                                {nsIdToNameMap[ns]}
                            </td>
                            {sectors.map((sector) => (
                                <td key={sector.key}>
                                    {nsSectorMap[sector.key] && (
                                        <div className={styles.checkmarkContainer}>
                                            <IoCheckmarkCircleSharp />
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    );
                })
            }
        )
    ]), []);

    console.info(' this is table', nsIdToNameMap);

    return (
        <Container
            className={_cs(styles.membershipCoordinationTable, className)}
            heading={strings.countryPlanMembershipCoordinationTableTitle}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={data}
                columns={columns}
                keySelector={memberCoordinationKeySelector}
            />
            <table>
                <thead>
                    <tr>
                        <th>
                            <div className={styles.thContent}>
                                {strings.countryPlanNameOfPNS}
                            </div>
                        </th>
                        {sectors.map((s) => (
                            <th
                                key={s.key}
                                className={styles.rotated}
                            >
                                <div className={styles.thContent}>
                                    {s.value}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {nsGroupedCoordinationKeys.map((ns) => {
                        const nsSectors = nsGroupedCoordination[ns];
                        const nsSectorMap = listToMap(nsSectors, (d) => d, () => true);

                        return (
                            <tr key={ns}>
                                <td>
                                    {nsIdToNameMap[ns]}
                                </td>
                                {sectors.map((sector) => (
                                    <td key={sector.key}>
                                        {nsSectorMap[sector.key] && (
                                            <div className={styles.checkmarkContainer}>
                                                <IoCheckmarkCircleSharp />
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Container>
    );
}

export default MemberCoordinationTable;
