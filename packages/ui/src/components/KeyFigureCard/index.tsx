import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import InlineLayout from '#components/InlineLayout';
import KeyFigure, { type Props as KeyFigureProps } from '#components/KeyFigure';
import ListView from '#components/ListView';
import ProgressBar from '#components/ProgressBar';
import { BoxShadowType } from '#utils/style';

import styles from './styles.module.css';

export type Props = {
    className?: string;

    icon?: React.ReactNode;
    info?: React.ReactNode;

    progressTitle?: React.ReactNode;
    progress?: number;
    progressDescription?: React.ReactNode;

    /** Shadow token for the card surface (the old withShadow boolean meant 'md') */
    boxShadow?: BoxShadowType;
} & KeyFigureProps;

/**
 * KeyFigure presented on a white card surface, optionally with an
 * icon, an info slot and a progress bar (specific layer).
 *
 * All KeyFigure props (label, textSize and the RawOutput value union)
 * are forwarded to the embedded KeyFigure.
 */
function KeyFigureCard(props: Props) {
    const {
        className,

        progress,
        progressTitle,
        progressDescription,
        icon,
        info,
        boxShadow,

        ...keyFigureProps
    } = props;

    return (
        <Container
            pending={false}
            empty={false}
            errored={false}
            filtered={false}
            className={_cs(styles.keyFigureCard, className)}
            withPadding
            backgroundColor="foreground"
            boxShadow={boxShadow}
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

export default KeyFigureCard;
