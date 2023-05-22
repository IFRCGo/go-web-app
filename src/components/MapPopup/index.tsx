import { MapPopup as BasicMapPopup } from '@togglecorp/re-map';
import { CloseLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';
import Container, { Props as ContainerProps } from '#components/Container';
import Button from '#components/Button';

import styles from './styles.module.css';

const popupOptions: mapboxgl.PopupOptions = {
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    offset: 8,
    className: styles.mapPopup,
    maxWidth: 'unset',
};

interface Props extends ContainerProps {
    coordinates: mapboxgl.LngLatLike;
    children: React.ReactNode;
    onCloseButtonClick: () => void;
}

function MapPopup(props: Props) {
    const {
        children,
        coordinates,
        onCloseButtonClick,
        actions,
        childrenContainerClassName,
        ...containerProps
    } = props;

    return (
        <BasicMapPopup
            coordinates={coordinates}
            popupOptions={popupOptions}
            hidden={false}
        >
            <Container
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...containerProps}
                className={styles.container}
                ellipsizeHeading
                childrenContainerClassName={_cs(styles.content, childrenContainerClassName)}
                withHeaderBorder
                actions={(
                    <>
                        {actions}
                        <Button
                            className={styles.closeButton}
                            name={undefined}
                            variant="tertiary"
                            onClick={onCloseButtonClick}
                        >
                            <CloseLineIcon />
                        </Button>
                    </>
                )}
            >
                {children}
            </Container>
        </BasicMapPopup>
    );
}

export default MapPopup;
