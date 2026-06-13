import { useOutletContext } from 'react-router-dom';
import {
    Container,
    DataDisplay,
    ListView,
    RawList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type CountryOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DirectoryItem = GoApiResponse<'/api/v2/country/{id}/'>['directory'][number];

interface NsDirectoryProps {
    directory: DirectoryItem;
}

function NsDirectory(props: NsDirectoryProps) {
    const { directory } = props;

    return (
        <div className={styles.nsDirectory}>
            <div className={styles.fullName}>
                {[directory?.first_name, directory?.last_name].filter(isTruthyString).join(' ')}
            </div>
            <div className={styles.position}>
                {directory?.position}
            </div>
        </div>
    );
}

interface Props {
    className?: string;
}

function NationalSocietyDirectory(props: Props) {
    const { className } = props;
    const strings = useTranslation(i18n);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const directoryList = countryResponse?.directory ?? [];

    return (
        <Container
            className={className}
            heading={strings.countryNSDirectoryTitle}
            withHeaderBorder
            footerActions={isDefined(directoryList)
                && directoryList.length > 0
                && isDefined(countryResponse?.society_name)
                && isDefined(countryResponse.url_ifrc) && (
                <DataDisplay
                    label={strings.countryNSDirectorySource}
                    value={(
                        <Link
                            styleVariant="action"
                            href={countryResponse.url_ifrc}
                            external
                            withUnderline
                            withLinkIcon
                        >
                            {countryResponse.society_name}
                        </Link>
                    )}
                />
            )}
            pending={false}
            errored={false}
            filtered={false}
            empty={directoryList.length === 0}
            withContentOverflow
        >
            <ListView
                layout="block"
                withSpacingOpticalCorrection
            >
                <RawList
                    data={directoryList}
                    keySelector={({ id }) => id}
                    renderer={NsDirectory}
                    rendererParams={(_, datum) => ({ directory: datum })}
                />
            </ListView>
        </Container>
    );
}

export default NationalSocietyDirectory;
