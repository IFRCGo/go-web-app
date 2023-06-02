import { generatePath } from 'react-router-dom';
import { useContext } from 'react';
import {
    IoChevronForwardOutline,
} from 'react-icons/io5';
import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface ProvinceResult {
    id: number;
    name: string;
    score: number;
    country: string;
    country_id: number;
}

interface Props {
    data: ProvinceResult[] | undefined;
    actions: React.ReactNode;
}

function ProvinceList(props: Props) {
    const {
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);
    const { country: countryRoute } = useContext(RouteContext);

    if (!data) {
        return null;
    }

    return (
        <Container
            actions={actions}
            heading={strings.searchIfrcProvince}
            className={styles.provinceList}
        >
            {data.map((province) => (
                <div
                    key={province.id}
                    className={styles.provinceName}
                >
                    <Link
                        to={generatePath(
                            countryRoute.absolutePath,
                            { countryId: String(province.country_id) },
                        )}
                        className={styles.countryName}
                        key={province.id}
                        underline
                        actions={<IoChevronForwardOutline />}
                    >
                        {province.country}
                    </Link>
                    {province.name}
                </div>
            ))}
        </Container>
    );
}

export default ProvinceList;
