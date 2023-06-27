import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from '../i18n.json';
import styles from './styles.module.css';

export interface StrategicPriority {
    id: number;
    country_plan: number;
    funding_requirement: number | null;
    people_targeted: number | null;
    type: string | null;
    type_display: string | null;
}

interface Props {
    className?: string;
    data?: StrategicPriority[];
}

// eslint-disable-next-line import/prefer-default-export
function StrategicPrioritiesTable(props: Props) {
    const {
        className,
        data,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={_cs(styles.strategicPrioritiesTable, className)}
            heading={strings.countryPlanStrategicPrioritiesTableHeading}
            childrenContainerClassName={styles.content}
        >
            <table>
                <thead>
                    <tr>
                        <th>
                            {strings.countryPlanStrategicPriority}
                        </th>
                        <th>
                            {strings.countryPlanPeopleTargeted}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((sp) => (
                        <tr key={sp.type}>
                            <td>
                                {sp.type_display}
                            </td>
                            <td>
                                <NumberOutput
                                    value={sp.people_targeted}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Container>
    );
}

export default StrategicPrioritiesTable;
