import { Container } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';

import styles from './styles.module.css';

interface Props {
    emergencyId: number | null | undefined;
    emergencyName: string | null | undefined;
    appealDocumentURL: string | null | undefined;
    appealDocumentName: string | null | undefined;
}
function Emergency(props: Props) {
    const {
        emergencyId,
        emergencyName,
        appealDocumentURL,
        appealDocumentName,
    } = props;

    return (
        <Container
            className={styles.emergency}
            childrenContainerClassName={styles.content}
        >
            <Link
                to="emergencyDetails"
                urlParams={{
                    emergencyId,
                }}
                withUnderline
            >
                {emergencyName}
            </Link>
            {isDefined(appealDocumentURL) && (
                <Link
                    href={appealDocumentURL}
                    withLinkIcon
                    external
                >
                    {appealDocumentName}
                </Link>
            )}
        </Container>
    );
}

export default Emergency;
