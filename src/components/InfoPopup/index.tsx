import { _cs } from '@togglecorp/fujs';
import { InformationLineIcon } from '@ifrc-go/icons';

import DropdownMenu from '#components/DropdownMenu';
import Container from '#components/Container';

import styles from './styles.module.css';

interface Props {
    icon?: React.ReactNode;
    withoutIcon?: boolean;
    infoLabel?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
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
            dropdownContainerClassName={styles.dropdownContainer}
            className={_cs(styles.infoPopup, className)}
            variant="tertiary"
            withoutDropdownIcon
        >
            <Container
                heading={title}
                childrenContainerClassName={styles.content}
            >
                {description}
            </Container>
        </DropdownMenu>
    );
}

export default InfoPopup;
