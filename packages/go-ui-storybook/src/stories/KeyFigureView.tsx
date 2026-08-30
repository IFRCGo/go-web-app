import {
    KeyFigureView as PureKeyFigureView,
    KeyFigureViewProps,
} from '@ifrc-go/ui';

function KeyFigureView(props: KeyFigureViewProps) {
    return (
        <PureKeyFigureView {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default KeyFigureView;
