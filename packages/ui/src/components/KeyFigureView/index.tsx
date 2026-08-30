import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import KeyFigure, { type Props as KeyFigureProps } from '#components/KeyFigure';
import ListView from '#components/ListView';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.module.css';

export type Props = {
    className?: string;
    children?: React.ReactNode;

    icon?: React.ReactNode;
    info?: React.ReactNode;

    progressTitle?: React.ReactNode;
    progress?: number;
    progressDescription?: React.ReactNode;

    withShadow?: boolean;
} & KeyFigureProps;

function KeyFigureView(props: Props) {
    const {
        className,

        progress,
        progressTitle,
        progressDescription,
        icon,
        info,
        withShadow,

        ...keyFigureProps
    } = props;

    return (
        <Container
            pending={false}
            empty={false}
            errored={false}
            filtered={false}
            className={_cs(styles.keyFigureView, className)}
            withPadding
            withBackground
            withShadow={withShadow}
            withoutSpacingOpticalCorrection={isDefined(icon) || isDefined(info)}
        >
            <ListView layout="block">
                <ListView
                    layout="block"
                    spacing="none"
                >
                    {(isDefined(icon) || isDefined(info)) && (
                        <InlineLayout
                            after={info}
                            childrenContainerClassName={styles.icon}
                            contentAlignment="start"
                        >
                            {icon}
                        </InlineLayout>
                    )}
                    <KeyFigure
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...keyFigureProps}
                    />
                </ListView>
                {isDefined(progress) && (
                    <ProgressBar
                        title={progressTitle}
                        value={progress}
                        totalValue={100}
                        description={progressDescription}
                    />
                )}
            </ListView>
        </Container>
    );
}

export default KeyFigureView;
