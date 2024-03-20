import {
    KeyFigure as PureKeyFigure,
    KeyFigureProps as PureKeyFigureProps,
} from '@ifrc-go/ui';

interface KeyFigureProps extends PureKeyFigureProps{}

function WrappedKeyFigure(props: KeyFigureProps) {
    return (

        <PureKeyFigure {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedKeyFigure;
