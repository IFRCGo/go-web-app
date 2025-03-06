import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    countryName?: string;
    emergencyId?: number;
    emergencyName: string | null | undefined;
    appealDocumentURL: string;
    extract: string | null | undefined;
    operationStartDate: string | null | undefined;
}
function Extract(props: Props) {
    const {
        countryName,
        emergencyId,
        emergencyName,
        appealDocumentURL,
        extract,
        operationStartDate,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            className={styles.extract}
            headingContainerClassName={styles.extractHeadingContainer}
            heading={countryName}
            headingDescription={(
                <Link
                    to="emergencyDetails"
                    urlParams={{
                        emergencyId,
                    }}
                    withUnderline
                >
                    {emergencyName}
                </Link>
            )}
            actions={(
                <Link
                    variant="primary"
                    href={appealDocumentURL}
                    withLinkIcon
                    external
                >
                    {strings.source}
                </Link>
            )}
            footerContent={(
                <TextOutput
                    label={strings.dateOfOperation}
                    value={operationStartDate}
                    strongValue
                    valueType="date"
                />
            )}
            withInternalPadding
        >
            {extract}
        </Container>
    );
}

export default Extract;
