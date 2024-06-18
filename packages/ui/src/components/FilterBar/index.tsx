import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import type { SpacingType } from '#components/types';
import useSpacingTokens from '#hooks/useSpacingTokens';

import styles from './styles.module.css';

interface GridWithActionsProps {
    grid?: React.ReactNode;
    actions?: React.ReactNode;
    spacing?: SpacingType;
}

function GridWithActions(props: GridWithActionsProps) {
    const {
        grid,
        actions,
        spacing = 'default',
    } = props;

    const gapTokens = useSpacingTokens({
        spacing,
        mode: 'gap',
    });
    const actionsGapTokens = useSpacingTokens({
        spacing,
        mode: 'gap',
        inner: true,
    });
    const gridGapTokens = useSpacingTokens({
        spacing,
        mode: 'grid-gap',
    });

    if (isNotDefined(grid) && isNotDefined(actions)) {
        return null;
    }

    return (
        <div className={_cs(styles.gridWithActions, gapTokens)}>
            <div className={_cs(styles.grid, gridGapTokens)}>
                {grid}
            </div>
            {isDefined(actions) && (
                <div className={_cs(styles.actions, actionsGapTokens)}>
                    {actions}
                </div>
            )}
        </div>
    );
}

interface Props {
    className?: string;
    filters?: React.ReactNode;
    filterActions?: React.ReactNode;
    search?: React.ReactNode;
    searchActions?: React.ReactNode;
    filterPreview?: React.ReactNode;
    spacing?: SpacingType;
}

function FilterBar(props: Props) {
    const {
        className,
        filters,
        filterActions,
        search,
        searchActions,
        filterPreview,
        spacing,
    } = props;

    if (
        isNotDefined(filters)
            && isNotDefined(filterActions)
            && isNotDefined(search)
            && isNotDefined(searchActions)
            && isNotDefined(filterPreview)
    ) {
        return null;
    }

    return (
        <div className={_cs(styles.filterBar, className)}>
            <GridWithActions
                grid={filters}
                actions={filterActions}
                spacing={spacing}
            />
            <GridWithActions
                grid={search}
                actions={searchActions}
                spacing={spacing}
            />
            {isDefined(filterPreview) && (
                <div className={styles.filterPreview}>
                    {filterPreview}
                </div>
            )}
        </div>
    );
}

export default FilterBar;
