import {
    InfoPopup as PureInfoPopup,
    InfoPopupProps,
} from '@ifrc-go/ui';

function InfoPopup <N extends string>(props: InfoPopupProps<N>) {
    return (
        <PureInfoPopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InfoPopup;
