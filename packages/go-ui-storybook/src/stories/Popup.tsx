import {
    Popup as PurePopup,
    type PopupProps,
} from '@ifrc-go/ui';

function Popup(props: PopupProps) {
    return (
        <PurePopup {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Popup;
