import {
    Modal as PureModal,
    ModalProps as PureModalProps,
} from '@ifrc-go/ui';

type ModalProps = PureModalProps

function Modal(props: ModalProps) {
    return (
        <PureModal {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Modal;
