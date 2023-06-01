import React from 'react';
import {
    IoChevronForwardOutline,
} from 'react-icons/io5';

import Container from '#components/Container';
import Link from '#components/Link';

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
                    href={`/countries/${country.id}`}
                    className={styles.countryName}
                    key={country.id}
                >
                    {country.name}
                    <IoChevronForwardOutline />
                </Link>
            ))}
        </Container>
    );
}

export default CountryList;
