import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DrefDocumentLink from '#components/domain/DrefDocumentLink';
import {
    ANTICIPATION_HUB_URL,
    DREF_AA_MANUAL_URL,
    DREF_ERF_URL,
    DREF_GUIDELINES_URL,
    DREF_PROCEDURES_URL,
    DREF_RBM_URL,
} from '#utils/domain/dref';

import i18n from './i18n.json';

interface Resource {
    key: string;
    name: string;
    description: string;
    url: string | undefined;
}

interface Props {
    className?: string;
    // Both pillars open with the same two DREF documents and then diverge:
    // anticipatory adds the anticipatory-action references, response adds the
    // response framework and planning guidance.
    variant: 'anticipatory' | 'response';
}

function DrefKeyResources(props: Props) {
    const {
        className,
        variant,
    } = props;
    const strings = useTranslation(i18n);

    const sharedResources: Resource[] = [
        {
            key: 'procedures',
            name: strings.drefProceduresName,
            description: strings.drefProceduresDescription,
            url: DREF_PROCEDURES_URL,
        },
        {
            key: 'guidelines',
            name: strings.drefGuidelinesName,
            description: strings.drefGuidelinesDescription,
            url: DREF_GUIDELINES_URL,
        },
    ];

    const variantResources: Resource[] = variant === 'anticipatory'
        ? [
            {
                key: 'anticipationHub',
                name: strings.anticipationHubName,
                description: strings.anticipationHubDescription,
                url: ANTICIPATION_HUB_URL,
            },
            {
                key: 'aaManual',
                name: strings.aaManualName,
                description: strings.aaManualDescription,
                url: DREF_AA_MANUAL_URL,
            },
        ]
        : [
            {
                key: 'erf',
                name: strings.erfName,
                description: strings.erfDescription,
                url: DREF_ERF_URL,
            },
            {
                key: 'rbm',
                name: strings.rbmName,
                description: strings.rbmDescription,
                url: DREF_RBM_URL,
            },
        ];

    const resources = [...sharedResources, ...variantResources];

    return (
        <Container
            className={className}
            heading={strings.keyResourcesHeading}
            withHeaderBorder
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={4}
                minGridColumnSize="16rem"
            >
                {resources.map((resource) => (
                    <Container
                        key={resource.key}
                        heading={resource.name}
                        withHeaderBorder
                        withBackground
                        withPadding
                        withShadow
                        footerActions={(
                            <DrefDocumentLink
                                name={resource.key}
                                url={resource.url}
                                label={strings.openDocument}
                            />
                        )}
                    >
                        {resource.description}
                    </Container>
                ))}
            </ListView>
        </Container>
    );
}

export default DrefKeyResources;
