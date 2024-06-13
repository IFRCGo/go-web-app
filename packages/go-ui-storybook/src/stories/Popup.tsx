import {
    Popup as PurePopup,
    PopupProps as PurePopupProps,
} from '@ifrc-go/ui';

type PopupProps = PurePopupProps

function Popup(props: PopupProps) {
    return (
        <PurePopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Popup;
