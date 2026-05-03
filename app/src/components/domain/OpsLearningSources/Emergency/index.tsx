import { DownloadFillIcon } from '@ifrc-go/icons';
import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';

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
            withBackground
            withPadding
        >
            <ListView
                layout="grid"
                withSpacingOpticalCorrection
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
                        external
                        before={<DownloadFillIcon />}
                    >
                        {appealDocumentName}
                    </Link>
                )}
            </ListView>
        </Container>
    );
}

export default Emergency;
