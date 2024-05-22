import {
    InfoPopup as PureInfoPopup,
    InfoPopupProps as PureInfoPopupProps,
} from '@ifrc-go/ui';

type InfoPopupProps = PureInfoPopupProps

function WrappedInfoPopup(props: InfoPopupProps) {
    return (
        <PureInfoPopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedInfoPopup;
