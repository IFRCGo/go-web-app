import { Fragment } from 'react/jsx-runtime';
import { ArrowDropRightLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface RendererProps {
    children: React.ReactNode;
}

export interface BreadcrumbsProps<
    KEY,
    DATUM,
    RENDERER_PROPS extends RendererProps
> {
    className?: string;
    separator?: React.ReactNode;
    data: DATUM[] | undefined | null;
    keySelector(datum: DATUM, index: number): KEY;
    labelSelector(datum: DATUM, index: number): React.ReactNode;
    rendererParams(key: KEY, datum: DATUM, index: number, data: DATUM[]): Omit<RENDERER_PROPS, 'children'>;
    renderer: React.ComponentType<RENDERER_PROPS>;
}

function Breadcrumbs<KEY, DATUM, RENDERER_PROPS extends RendererProps>(
    props: BreadcrumbsProps<KEY, DATUM, RENDERER_PROPS>,
) {
    const {
        data,
        className,
        separator = <ArrowDropRightLineIcon />,
        renderer: Renderer,
        rendererParams,
        keySelector,
        labelSelector,
    } = props;

    if (isNotDefined(data)) {
        return null;
    }

    return (
        <nav
            className={_cs(styles.breadcrumbs, className)}
            aria-label="breadcrumb"
        >
            {data.map(
                (datum, i, array) => {
                    const key = keySelector(datum, i);
                    const rendererProps = {
                        ...rendererParams(key, datum, i, data),
                        children: (
                            <div className={styles.label}>
                                {labelSelector(datum, i)}
                            </div>
                        ),
                    } as RENDERER_PROPS;

                    return (
                        <Fragment key={String(key)}>
                            <Renderer
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...rendererProps}
                                className={styles.item}
                            />
                            {i !== array.length - 1 && (
                                <span
                                    className={styles.separator}
                                >
                                    {separator}
                                </span>
                            )}
                        </Fragment>
                    );
                },
            )}
        </nav>
    );
}

export default Breadcrumbs;
