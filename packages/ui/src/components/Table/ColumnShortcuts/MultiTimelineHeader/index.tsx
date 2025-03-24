import { _cs } from '@togglecorp/fujs';

import DateOutput from '#components/DateOutput';

import HeaderCell, { HeaderCellProps } from '../../HeaderCell';

import styles from './styles.module.css';

export interface Props extends HeaderCellProps {
    className?: string;
    dateRange: {
        start: Date,
        end: Date,
    } | undefined;
}

function MultiTimelineHeader(props: Props) {
    const {
        className,
        dateRange,
        ...otherProps
    } = props;

    return (
        <HeaderCell
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.multiTimelineHeader, className)}
            titleClassName={styles.title}
            title={(
                <>
                    <DateOutput
                        value={dateRange?.start}
                    />
                    <DateOutput
                        value={dateRange?.end}
                    />
                </>
            )}
        />
    );
}

export default MultiTimelineHeader;
