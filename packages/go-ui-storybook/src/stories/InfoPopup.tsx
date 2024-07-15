import {
    InfoPopup as PureInfoPopup,
    InfoPopupProps,
} from '@ifrc-go/ui';

function InfoPopup(props: InfoPopupProps) {
    return (
        <PureInfoPopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InfoPopup;
