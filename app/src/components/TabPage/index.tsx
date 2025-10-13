import {
    DefaultMessage,
    InlineLayout,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import WikiLink from '#components/WikiLink';

import styles from './styles.module.css';

interface Props {
    elementRef?: React.RefObject<HTMLDivElement | null>;
    children?: React.ReactNode;
    wikiLinkPathName?: string;

    pending?: boolean;
    overlayPending?: boolean;
    empty?: boolean;
    filtered?: boolean;
    errored?: boolean;
    emptyMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    withoutMessageIcon?: boolean;
    withCompactMessage?: boolean;

    spacingOffset?: number;
    headerAction?: React.ReactNode;
}

function TabPage(props: Props) {
    const {
        elementRef,
        children,
        wikiLinkPathName,
        headerAction,

        empty = false,
        filtered = false,
        pending = false,
        overlayPending,
        errored = false,
        emptyMessage,
        filteredEmptyMessage,
        pendingMessage,
        errorMessage,
        withoutMessageIcon,
        withCompactMessage,
        spacingOffset,
    } = props;

    const mainContent = (children || empty || pending || errored || filtered) && (
        <>
            <DefaultMessage
                className={styles.message}
                pending={pending}
                filtered={filtered}
                errored={errored}
                empty={empty}
                overlayPending={overlayPending}
                emptyMessage={emptyMessage}
                filteredEmptyMessage={filteredEmptyMessage}
                pendingMessage={pendingMessage}
                errorMessage={errorMessage}
                withoutIcon={withoutMessageIcon}
                compact={withCompactMessage}
            />
            {!empty && !errored && (!pending || overlayPending) && children}
        </>
    );

    return (
        <div
            ref={elementRef}
            className={styles.tabPage}
        >
            <div className={styles.action}>
                {isDefined(headerAction) && (
                    <InlineLayout
                        spacing="xs"
                        className={styles.headerAction}
                        after={(headerAction)}
                    />
                )}
                {isDefined(wikiLinkPathName) && (
                    <WikiLink
                        pathName={wikiLinkPathName}
                    />
                )}
            </div>
            <ListView
                layout="block"
                spacing="3xl"
                spacingOffset={spacingOffset}
            >
                {mainContent}
            </ListView>
        </div>
    );
}

export default TabPage;
