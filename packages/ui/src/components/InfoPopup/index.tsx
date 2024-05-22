import { InformationLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import DropdownMenu from '#components/DropdownMenu';

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
}

function InfoPopup(props: Props) {
    const {
        className,
        icon = <InformationLineIcon />,
        infoLabel,
        title,
        description,
        withoutIcon,
        popupClassName,
        descriptionClassName,
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
            variant="tertiary"
            withoutDropdownIcon
        >
            <Container
                heading={title}
                childrenContainerClassName={_cs(descriptionClassName, styles.content)}
                withInternalPadding
            >
                {description}
            </Container>
        </DropdownMenu>
    );
}

export default InfoPopup;
