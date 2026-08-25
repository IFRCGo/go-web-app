import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    InlineLayout,
    ListView,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Size = 'sm' | 'md' | 'lg';

const sizeToClassName: Record<Size, string | undefined> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
};

interface Props {
    className?: string;
    contentClassName?: string;
    children?: React.ReactNode;
    size?: Size;
    // NOTE: the expanded state resets when this changes, so an instance that
    // gets re-used for different content does not stay expanded
    resetKey?: string | number | null;
}

function ClampedContent(props: Props) {
    const {
        className,
        contentClassName,
        children,
        size = 'md',
        resetKey,
    } = props;

    const strings = useTranslation(i18n);

    const [
        expanded,
        {
            setFalse: collapse,
            toggle: toggleExpanded,
        },
    ] = useBooleanState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [overflows, setOverflows] = useState(false);

    useEffect(() => {
        collapse();

        const element = contentRef.current;
        if (isNotDefined(element)) {
            return undefined;
        }

        // NOTE: the content height changes after the initial render (images and
        // embeds load lazily, viewport resizes reflow the text), so we
        // re-measure whenever the element's box changes instead of once
        const resizeObserver = new ResizeObserver(() => {
            setOverflows(element.scrollHeight > element.clientHeight);
        });
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [resetKey, collapse]);

    return (
        <ListView
            layout="block"
            className={_cs(styles.clampedContent, className)}
        >
            <div
                ref={contentRef}
                className={_cs(
                    styles.content,
                    contentClassName,
                    !expanded && styles.collapsed,
                    !expanded && sizeToClassName[size],
                )}
            >
                {children}
            </div>
            {/* NOTE: measuring against the collapsed box means overflows reads
              * false once expanded, so the toggle is kept while expanded */}
            {(overflows || expanded) && (
                <InlineLayout
                    after={(
                        <Button
                            styleVariant="action"
                            name={undefined}
                            onClick={toggleExpanded}
                            textSize="sm"
                            after={expanded
                                ? <ChevronUpLineIcon />
                                : <ChevronDownLineIcon />}
                        >
                            {expanded
                                ? strings.clampedContentSeeLess
                                : strings.clampedContentSeeMore}
                        </Button>
                    )}
                />
            )}
        </ListView>
    );
}

export default ClampedContent;
