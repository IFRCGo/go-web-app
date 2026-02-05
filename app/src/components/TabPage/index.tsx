import {
    DefaultMessage,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import SectionQualityCriteria from '#components/domain/SectionQualityCriteria';
import WikiLink from '#components/WikiLink';

import styles from './styles.module.css';

interface Props {
    elementRef?: React.RefObject<HTMLDivElement>;
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
    sectionCriteriaHeading?: string;
    sectionCriteriaContent?: React.ReactNode;
}

function TabPage(props: Props) {
    const {
        elementRef,
        children,
        wikiLinkPathName,

        sectionCriteriaHeading,
        sectionCriteriaContent,

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
            {isDefined(wikiLinkPathName) && (
                <WikiLink
                    className={styles.wikiLink}
                    pathName={wikiLinkPathName}
                />
            )}
            {isDefined(sectionCriteriaContent) && (
                <SectionQualityCriteria
                    heading={sectionCriteriaHeading}
                    content={sectionCriteriaContent}
                />
            )}
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
