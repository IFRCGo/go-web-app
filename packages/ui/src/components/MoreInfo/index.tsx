import {
    useCallback,
    useState,
} from 'react';
import { InformationLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import Dialog from '#components/Dialog';
import Dropdown from '#components/Dropdown';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    /** How the info content is revealed (defaults to `'popover'`) */
    as?: 'popover' | 'dialog';
    icon?: React.ReactNode;
    /** Hide the info icon (shown by default) */
    withoutIcon?: boolean;
    /** Visible trigger content (replaces the deprecated `infoLabel`) */
    label?: React.ReactNode;
    /**
     * @deprecated use `label`
     */
    infoLabel?: React.ReactNode;
    /** Accessible name for the trigger when it has no visible text label */
    ariaLabel?: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
    /**
     * @deprecated use `children`
     */
    description?: React.ReactNode;
    popupClassName?: string;
    className?: string;
}

/**
 * Generic info affordance (specific layer).
 *
 * A small trigger (an info icon by default) that reveals a title and body in a
 * Popover (`as='popover'`, via the generic Dropdown disclosure) or in a modal
 * Dialog (`as='dialog'`). The trigger is a real `<button>` advertising
 * `aria-haspopup` and an accessible name.
 */
function MoreInfo(props: Props) {
    const {
        as = 'popover',
        className,
        icon = <InformationLineIcon />,
        label,
        infoLabel,
        ariaLabel,
        title,
        children,
        description,
        withoutIcon,
        popupClassName,
    } = props;

    const strings = useTranslation(i18n);

    const [showDialog, setShowDialog] = useState(false);

    const handleDialogOpen = useCallback(() => { setShowDialog(true); }, []);
    const handleDialogClose = useCallback(() => { setShowDialog(false); }, []);

    const triggerLabel = label ?? infoLabel;
    const body = children ?? description;
    const hasVisibleLabel = !isNotDefined(triggerLabel);
    const accessibleName = ariaLabel
        ?? (hasVisibleLabel ? undefined : strings.moreInfoLabel);

    const triggerContent = (
        <div className={styles.label}>
            {triggerLabel}
            {!withoutIcon && icon && (
                <div className={styles.icon}>
                    {icon}
                </div>
            )}
        </div>
    );

    if (as === 'dialog') {
        return (
            <div className={_cs(styles.moreInfo, className)}>
                <Button
                    name={undefined}
                    onClick={handleDialogOpen}
                    variant="tertiary"
                    spacing="none"
                    aria-haspopup="dialog"
                    aria-expanded={showDialog}
                    aria-label={accessibleName}
                >
                    {triggerContent}
                </Button>
                {showDialog && (
                    <Dialog
                        heading={title}
                        onClose={handleDialogClose}
                        closeOnEscape
                        closeOnClickOutside
                        size="sm"
                        className={popupClassName}
                    >
                        {body}
                    </Dialog>
                )}
            </div>
        );
    }

    return (
        <Dropdown
            label={triggerContent}
            ariaHasPopup="dialog"
            ariaLabel={accessibleName}
            popupClassName={_cs(styles.dropdownContainer, popupClassName)}
            className={_cs(styles.moreInfo, className)}
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
                {body}
            </Container>
        </Dropdown>
    );
}

export default MoreInfo;
