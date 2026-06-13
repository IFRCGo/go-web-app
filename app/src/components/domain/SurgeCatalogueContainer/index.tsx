import { useCallback } from 'react';
import { ArrowLeftLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Image,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import useRouting from '#hooks/useRouting';

import { type WrappedRoutes } from '../../../App/routes';

import i18n from './i18n.json';

interface ImageListItem {
    src: string;
    caption?: string;
}

interface Props {
    heading: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    goBackFallbackLink?: keyof WrappedRoutes;
    imageList?: ImageListItem[];
}

function SurgeCatalogueContainer(props: Props) {
    const {
        heading,
        description,
        children,
        goBackFallbackLink,
        imageList,
    } = props;

    const strings = useTranslation(i18n);

    const { goBack } = useRouting();
    const handleBackButtonClick = useCallback(() => {
        if (isDefined(goBackFallbackLink)) {
            goBack(goBackFallbackLink);
        }
    }, [goBack, goBackFallbackLink]);

    return (
        <Container
            headingLevel={2}
            heading={heading}
            headerDescription={(
                <ListView layout="block">
                    {description}
                </ListView>
            )}
            filters={imageList?.map(
                (image) => (
                    <Image
                        key={image.src}
                        src={image.src}
                        caption={image.caption}
                        withoutCaption
                        expandable
                        size="md"
                    />
                ),
            )}
            headerIcons={isDefined(goBackFallbackLink) && (
                <Button
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    title={strings.surgeGoBack}
                    textSize="lg"
                >
                    <ArrowLeftLineIcon />
                </Button>
            )}
            spacing="lg"
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                {children}
            </ListView>
        </Container>
    );
}

export default SurgeCatalogueContainer;
