import {
    Popup as PurePopup,
    PopupProps as PurePopupProps,
} from '@ifrc-go/ui';

type PopupProps = PurePopupProps

function WrappedPopup(props: PopupProps) {
    return (
        <PurePopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedPopup;
