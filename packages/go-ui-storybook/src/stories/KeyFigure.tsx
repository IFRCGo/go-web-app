import { ComponentProps } from 'react';
import { KeyFigure as PureKeyFigure } from '@ifrc-go/ui';

// FIXME: let's export TimeSeriesChartProps from @ifrc-go/ui
type KeyFigureProps = ComponentProps<typeof PureKeyFigure>

function KeyFigure(props: KeyFigureProps) {
    return (
        <PureKeyFigure {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default KeyFigure;
