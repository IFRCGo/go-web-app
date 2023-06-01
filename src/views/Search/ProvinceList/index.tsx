import React from 'react';
import {
    IoChevronForwardOutline,
} from 'react-icons/io5';
import Container from '#components/Container';
import Link from '#components/Link';
import LanguageContext from '#root/languageContext';

import styles from './styles.module.scss';

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

    const { strings } = React.useContext(LanguageContext);

    if (!data) {
        return null;
    }

    return (
        <Container
            actions={actions}
            contentClassName={styles.provinceList}
            heading={strings.searchIfrcProvince}
        >
            {data.map((district) => (
                <div
                    key={district.id}
                    className={styles.provinceName}
                >
                    <Link
                        href={`/countries/${district.country_id}`}
                        className={styles.countryName}
                        key={district.id}

                    >
                        {district.country}
                        <IoChevronForwardOutline />
                    </Link>
                    {district.name}
                </div>
            ))}
        </Container>
    );
}

export default ProvinceList;
