import { useCallback } from 'react';
import {
    CloseLineIcon,
    InformationLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import DropdownMenu from '#components/DropdownMenu';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    icon?: React.ReactNode;
    withoutIcon?: boolean;
    infoLabel?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    descriptionClassName?: string;
    popupClassName?: string;
    className?: string;
    onCloseButtonClick?: () => void;
}

function InfoPopup(props: Props) {
    const {
        className,
        icon = <InformationLineIcon />,
        infoLabel,
        title,
        description,
        withoutIcon,
        onCloseButtonClick,
        popupClassName,
        descriptionClassName,
    } = props;

    const strings = useTranslation(i18n);
    const handleCloseButtonClick = useCallback(
        () => {
            if (onCloseButtonClick) {
                onCloseButtonClick();
            }
        },
        [onCloseButtonClick],
    );

    return (
        <DropdownMenu
            label={(
                <div className={styles.label}>
                    {infoLabel}
                    {!withoutIcon && icon && (
                        <div className={styles.icon}>
                            {icon}
                        </div>
                    )}
                </div>
            )}
            popupClassName={_cs(styles.dropdownContainer, popupClassName)}
            className={_cs(styles.infoPopup, className)}
            variant="tertiary"
            withoutDropdownIcon
        >
            <Container
                heading={title}
                childrenContainerClassName={_cs(descriptionClassName, styles.content)}
                withInternalPadding
                withHeaderBorder
                actions={(
                    <Button
                        name={undefined}
                        onClick={handleCloseButtonClick}
                        variant="tertiary"
                        title={strings.closeButtonLabel}
                    >
                        <CloseLineIcon className={styles.closeIcon} />
                    </Button>
                )}
            >
                {description}
            </Container>
        </DropdownMenu>
    );
}

export default InfoPopup;
