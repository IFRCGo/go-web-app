import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import i18n from './i18n.json';

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
            heading={countryName}
            headingLevel={5}
            headerDescription={(
                <Link
                    to="emergencyDetails"
                    urlParams={{
                        emergencyId,
                    }}
                    withUnderline
                    withLinkIcon
                >
                    {emergencyName}
                </Link>
            )}
            headerActions={(
                <Link
                    colorVariant="primary"
                    styleVariant="filled"
                    href={appealDocumentURL}
                    withLinkIcon
                    external
                >
                    {strings.source}
                </Link>
            )}
            footer={(
                <TextOutput
                    label={strings.dateOfOperation}
                    value={operationStartDate}
                    strongValue
                    valueType="date"
                />
            )}
            withPadding
            withDarkBackground
        >
            {extract}
        </Container>
    );
}

export default Extract;
