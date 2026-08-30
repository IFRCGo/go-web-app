import { DownloadFillIcon } from '@ifrc-go/icons';
import {
    Container,
    Description,
    ListView,
} from '@ifrc-go/ui';

import Link from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

type GetKeyDocumentResponse = GoApiResponse<'/api/v2/country-document/'>;
type KeyDocumentItem = NonNullable<GetKeyDocumentResponse['results']>[number];

interface Props {
    label: string;
    documents: KeyDocumentItem[];
}

function DocumentListCard(props: Props) {
    const {
        label,
        documents,
    } = props;

    return (
        <Container
            errored={false}
            empty={false}
            pending={false}
            filtered={false}
            heading={label}
            headingLevel={4}
            withHeaderBorder
            withPadding
            withShadow
            withBackground
            withContentOverflow
            withFixedHeight
        >
            <ListView
                layout="block"
                withSpacingOpticalCorrection
            >
                {documents.map((document) => (
                    <Container
                        errored={false}
                        empty={false}
                        pending={false}
                        filtered={false}
                        key={document.id}
                        heading={document.year_text}
                        headerActions={(
                            <Link
                                external
                                href={document.url}
                            >
                                <DownloadFillIcon />
                            </Link>
                        )}
                        headingLevel={5}
                        withEllipsizedHeading
                        spacing="xs"
                        withoutWrapInHeader
                    >
                        <Description
                            textSize="sm"
                            withLightText
                        >
                            {document.name}
                        </Description>
                    </Container>
                ))}
            </ListView>
        </Container>
    );
}

export default DocumentListCard;
