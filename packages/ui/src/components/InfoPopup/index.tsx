import { InformationLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.module.css';

export interface Props {
    icon?: React.ReactNode;
    /** Hide the info icon (shown by default) */
    withoutIcon?: boolean;
    infoLabel?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    popupClassName?: string;
    className?: string;
}

/**
 * Specific component for a small information trigger that reveals
 * a title and description in a dropdown popup.
 */
function InfoPopup(props: Props) {
    const {
        className,
        icon = <InformationLineIcon />,
        infoLabel,
        title,
        description,
        withoutIcon,
        popupClassName,
    } = props;

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
            labelVariant="tertiary"
            labelSpacing="none"
            withoutDropdownIcon
        >
            <Container
                pending={false}
                empty={false}
                filtered={false}
                errored={false}
                heading={title}
                withPadding
            >
                {description}
            </Container>
        </DropdownMenu>
    );
}

export default InfoPopup;
