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
import { createElementColumn, createStringColumn } from '#components/Table/ColumnShortcuts';

import i18n from '../i18n.json';
import styles from './styles.module.css';

interface IconRendererProps { 
    item: number;
    sector: {
        key: string;
        value: string;
    }
}
interface Props {
    className?: string;
    data: MembershipCoordination[] | undefined;
}

function keySelector(value: number) {
    return value;
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

    console.warn('sector', sectors);

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
    
    const columns = useMemo(() => {
        const IconRenderer = ({ item, sector }: IconRendererProps) => {
            const nsSectors = nsGroupedCoordination[item];
            const nsSectorMap = listToMap(nsSectors, (d) => d, () => true);
            return (nsSectorMap[sector.key] ? (
                <div className={styles.checkmarkContainer}>
                    <IoCheckmarkCircleSharp />
                </div>
            ) : null)
        }
        return [
        createStringColumn<number, number>(
            'national_society_name',
            strings.countryPlanNameOfPNS,
            (item) => (nsIdToNameMap[item])
        ),
        ...sectors.map((sector) => (
            createElementColumn<number, number, IconRendererProps>(
                sector.key,
                sector.value,
                IconRenderer,
                (_, data) => ({ item: data, sector }),
            )
        ))
    ]}, []);

    return (
        <Container
            className={_cs(styles.membershipCoordinationTable, className)}
            heading={strings.countryPlanMembershipCoordinationTableTitle}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={nsGroupedCoordinationKeys}
                columns={columns}
                keySelector={keySelector}
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
