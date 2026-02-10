import {
    KeyFigureView as PureKeyFigure,
    KeyFigureViewProps,
} from '@ifrc-go/ui';

function KeyFigure(props: KeyFigureViewProps) {
    return (
        <PureKeyFigure {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default KeyFigure;
