import { useOutletContext } from 'react-router-dom';

import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { type CountryOutletContext } from '#utils/outletContext';
import { resolveToString } from '#utils/translation';

import styles from './styles.module.css';
import i18n from './i18n.json';

function NationalSocietyDirectory() {
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const directoryList = countryResponse?.directory;

    return (
        <Container
            childrenContainerClassName={styles.nationalSocietyDirectory}
            heading={strings.countryNSDirectoryTitle}
            withHeaderBorder
        >
            <>
                <div>
                    {directoryList?.map((directory) => (
                        <TextOutput
                            value={directory?.position}
                            label={`${directory?.first_name} ${directory?.last_name}`}
                            strongLabel
                        />
                    ))}
                </div>
                <div className={styles.nationalSocietySource}>
                    <Link
                        variant="tertiary"
                        href={countryResponse?.society_url}
                        external
                        withUnderline
                    >
                        {resolveToString(
                            strings.countryNSDirectorySource,
                            { sourceLink: countryResponse?.society_name },
                        )}
                    </Link>
                </div>
            </>
        </Container>
    );
}

export default NationalSocietyDirectory;
