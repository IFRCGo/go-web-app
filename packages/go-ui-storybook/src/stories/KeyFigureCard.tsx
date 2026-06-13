import {
    KeyFigureCard as PureKeyFigureCard,
    KeyFigureCardProps,
} from '@ifrc-go/ui';

function KeyFigureCard(props: KeyFigureCardProps) {
    return (
        <PureKeyFigureCard {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default KeyFigureCard;
