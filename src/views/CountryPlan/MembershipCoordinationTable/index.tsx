import { useMemo } from 'react';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import {
    _cs,
    isDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import i18n from '../i18n.json';
import styles from './styles.module.css';

export interface MembershipCoordination {
    id: number | null;
    country_plan: number;
    has_coordination: boolean;
    national_society: number;
    national_society_name: string;
    sector: string;
    sector_display: string;
}
interface Props {
    className?: string;
    data?: MembershipCoordination[];
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

    return (
        <Container
            className={_cs(styles.membershipCoordinationTable, className)}
            heading={strings.countryPlanMembershipCoordinationTableTitle}
            childrenContainerClassName={styles.content}
        >
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
