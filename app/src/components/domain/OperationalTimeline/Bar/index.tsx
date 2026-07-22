import { type ReactNode } from 'react';
import { DropdownMenu } from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import Link from '#components/Link';

import { type PositionedBar } from '../utils';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    bar: PositionedBar;
    lastUpdateLabel: ReactNode;
}

function Bar(props: Props) {
    const {
        className,
        bar,
        lastUpdateLabel,
    } = props;

    return (
        <div
            className={_cs(styles.bar, className)}
            style={{
                gridColumnStart: bar.startIndex + 1,
                gridColumnEnd: bar.endIndex + 2,
                gridRowStart: bar.lane + 1,
            }}
        >
            <DropdownMenu
                className={styles.pill}
                popupClassName={styles.popup}
                label={<span className={styles.pillLabel}>{bar.label}</span>}
                labelStyleVariant="translucent"
                labelColorVariant="secondary"
                preferredPopupWidth={22}
                withoutDropdownIcon
                persistent
            >
                <div className={styles.cardHeading}>
                    {bar.label}
                </div>
                {bar.lastUpdate && (
                    <div className={styles.lastUpdate}>
                        {lastUpdateLabel}
                        &nbsp;
                        {bar.lastUpdate}
                    </div>
                )}
                {bar.description && (
                    <div className={styles.cardDescription}>
                        {bar.description}
                    </div>
                )}
                {bar.document && (
                    <Link
                        href={bar.document.url}
                        external
                        withLinkIcon
                        withUnderline
                    >
                        {bar.document.label}
                    </Link>
                )}
            </DropdownMenu>
        </div>
    );
}

export default Bar;
