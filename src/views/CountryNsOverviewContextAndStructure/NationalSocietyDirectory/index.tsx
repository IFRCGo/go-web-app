import { useOutletContext } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';
import i18n from './i18n.json';

interface Props {
    className?: string;
}

function NationalSocietyDirectory(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const directoryList = countryResponse?.directory;

    return (
        <Container
            className={_cs(className, styles.nationalSocietyDirectory)}
            childrenContainerClassName={styles.content}
            heading={strings.countryNSDirectoryTitle}
            footerContent={(
                <TextOutput
                    label={strings.countryNSDirectorySource}
                    value={(
                        <Link
                            variant="tertiary"
                            href={countryResponse?.society_url}
                            external
                            withUnderline
                        >
                            {countryResponse?.society_name}
                        </Link>
                    )}
                />
            )}
            withHeaderBorder
        >
            {directoryList?.map((directory) => (
                <TextOutput
                    key={directory.id}
                    withoutLabelColon
                    value={directory?.position}
                    label={`${directory?.first_name} ${directory?.last_name}`}
                    strongLabel
                />
            ))}
        </Container>
    );
}

export default NationalSocietyDirectory;
