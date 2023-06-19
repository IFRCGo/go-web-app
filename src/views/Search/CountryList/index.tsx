import { generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface CountryResult {
    id: number;
    name: string;
    society_name: string;
    score: number;
}

interface Props {
    data: CountryResult[] | undefined;
    actions: React.ReactNode;
}

function CountryList(props: Props) {
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
            childrenContainerClassName={styles.countryList}
            heading={strings.searchIfrcCountry}
        >
            {data.map((country) => (
                <Link
                    to={generatePath(countryRoute.absolutePath, { countryId: String(country.id) })}
                    className={styles.countryName}
                    key={country.id}
                    actions={<IoChevronForwardOutline />}
                    withUnderline
                >
                    {country.name}
                </Link>
            ))}
        </Container>
    );
}

export default CountryList;
