import {
    KeyFigure as PureKeyFigure,
    KeyFigureProps,
} from '@ifrc-go/ui';

function KeyFigure(props: KeyFigureProps) {
    return (
        <PureKeyFigure {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default KeyFigure;
