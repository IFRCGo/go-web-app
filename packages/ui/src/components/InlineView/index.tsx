import { _cs } from '@togglecorp/fujs';

import InlineLayout, { Props as InlineLayoutProps } from '#components/InlineLayout';

import styles from './styles.module.css';

export interface Props extends InlineLayoutProps {
    layoutClassName?: string;
    layoutElementRef?: InlineLayoutProps['elementRef'];
    wrapBreakpoint?: 'sm' | 'md' | 'lg' | 'none';
}

function InlineView(props: Props) {
    const {
        layoutElementRef,
        layoutClassName,

        className,
        elementRef,
        before,
        beforeContainerClassName,
        children,
        childrenContainerClassName,
        after,
        afterContainerClassName,
        spacing,
        spacingOffset,
        withPadding,
        withoutSpacingOpticalCorrection,
        wrapBreakpoint = 'md',

        ...divProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            ref={elementRef}
            className={_cs(
                styles.inlineView,
                wrapBreakpoint === 'sm' && styles.withSmWrapBreakpoint,
                wrapBreakpoint === 'md' && styles.withMdWrapBreakpoint,
                wrapBreakpoint === 'lg' && styles.withLgWrapBreakpoint,
                className,
            )}
        >
            <InlineLayout
                className={_cs(styles.inlineLayout, layoutClassName)}
                elementRef={layoutElementRef}
                before={before}
                beforeContainerClassName={_cs(styles.beforeContent, beforeContainerClassName)}
                childrenContainerClassName={childrenContainerClassName}
                after={after}
                afterContainerClassName={_cs(styles.afterContent, afterContainerClassName)}
                spacing={spacing}
                spacingOffset={spacingOffset}
                withPadding={withPadding}
                withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
            >
                {children}
            </InlineLayout>
        </div>
    );
}

export default InlineView;
