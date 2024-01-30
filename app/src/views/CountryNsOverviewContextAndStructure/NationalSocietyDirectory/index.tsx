import { useOutletContext } from 'react-router-dom';
import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
            contentViewType="vertical"
        >
            {directoryList?.map((directory) => (
                <div
                    key={directory.id}
                    className={styles.directory}
                >
                    <div className={styles.fullName}>
                        {[directory?.first_name, directory?.last_name].filter(isTruthyString).join(' ')}
                    </div>
                    <div className={styles.position}>
                        {directory?.position}
                    </div>
                </div>
            ))}
        </Container>
    );
}

export default NationalSocietyDirectory;
