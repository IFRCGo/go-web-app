import { _cs, isNotDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

type SpacingType = 'none' | 'compact' | 'cozy' | 'comfortable' | 'relaxed' | 'loose';

const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
    comfortable: styles.comfortableSpacing,
    relaxed: styles.relaxedSpacing,
    loose: styles.looseSpacing,
};

interface Props {
    className?: string;
    icons?: React.ReactNode;
    children: React.ReactNode | null | undefined;
    actions?: React.ReactNode;
    iconsContainerClassName?: string;
    childrenContainerClassName?: string;
    actionsContainerClassName?: string;
    spacing?: SpacingType;
}

function useBasicLayout(props: Props) {
    const {
        className,
        icons,
        children,
        actions,
        iconsContainerClassName,
        childrenContainerClassName,
        actionsContainerClassName,
        spacing = 'comfortable',
    } = props;

    const containerClassName = _cs(
        styles.layoutContainer,
        spacingTypeToClassNameMap[spacing],
        className,
    );

    const emptyContent = isNotDefined(icons)
            && isNotDefined(children)
            && isNotDefined(actions);

    const content = emptyContent ? null : (
        <>
            {icons && (
                <div className={_cs(styles.iconsContainer, iconsContainerClassName)}>
                    {icons}
                </div>
            )}
            <div className={_cs(styles.childrenContainer, childrenContainerClassName)}>
                {children}
            </div>
            {actions && (
                <div className={_cs(styles.actionsContainer, actionsContainerClassName)}>
                    {actions}
                </div>
            )}
        </>
    );

    return {
        containerClassName,
        content,
    };
}

export default useBasicLayout;
