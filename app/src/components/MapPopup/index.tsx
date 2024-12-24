import { useMemo } from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    type ContainerProps,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';
import { MapPopup as BasicMapPopup } from '@togglecorp/re-map';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props extends ContainerProps {
    coordinates: mapboxgl.LngLatLike;
    children: React.ReactNode;
    onCloseButtonClick: () => void;
    popupClassName?: string;
}

function MapPopup(props: Props) {
    const {
        children,
        coordinates,
        onCloseButtonClick,
        actions,
        childrenContainerClassName,
        popupClassName,
        ...containerProps
    } = props;

    const strings = useTranslation(i18n);

    const popupOptions = useMemo<mapboxgl.PopupOptions>(() => ({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        offset: 8,
        className: _cs(styles.mapPopup, popupClassName),
        maxWidth: 'unset',
    }), [popupClassName]);

    return (
        <BasicMapPopup
            coordinates={coordinates}
            popupOptions={popupOptions}
            hidden={false}
            trackPointer={false}
        >
            <Container
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...containerProps}
                className={styles.container}
                withoutWrapInHeading
                childrenContainerClassName={_cs(styles.content, childrenContainerClassName)}
                withHeaderBorder
                withInternalPadding
                actions={(
                    <>
                        {actions}
                        <Button
                            className={styles.closeButton}
                            name={undefined}
                            variant="tertiary"
                            onClick={onCloseButtonClick}
                            title={strings.messagePopupClose}
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
