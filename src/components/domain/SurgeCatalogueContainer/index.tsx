import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import { isDefined } from '@togglecorp/fujs';

import Image from '#components/Image';
import IconButton from '#components/IconButton';
import Container from '#components/Container';
import useRouting from '#hooks/useRouting';
import { WrappedRoutes } from '../../../App/routes';

import styles from './styles.module.css';

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

    const { goBack } = useRouting();
    const handleBackButtonClick = useCallback(() => {
        if (isDefined(goBackFallbackLink)) {
            goBack(goBackFallbackLink);
        }
    }, [goBack, goBackFallbackLink]);

    return (
        <Container
            headingLevel={2}
            className={styles.surgeCatalogueContainer}
            childrenContainerClassName={styles.content}
            heading={heading}
            headerDescription={description}
            headerDescriptionContainerClassName={styles.description}
            filtersContainerClassName={styles.imageList}
            filters={imageList?.map(
                (image) => (
                    <Image
                        key={image.src}
                        src={image.src}
                        caption={image.caption}
                        imageClassName={styles.image}
                    />
                ),
            )}
            icons={isDefined(goBackFallbackLink) && (
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    variant="tertiary"
                    // FIXME: use translation
                    title="Go back"
                    // FIXME: use translation
                    ariaLabel="Go back"
                >
                    <ChevronLeftLineIcon />
                </IconButton>
            )}
        >
            {children}
        </Container>
    );
}

export default SurgeCatalogueContainer;
