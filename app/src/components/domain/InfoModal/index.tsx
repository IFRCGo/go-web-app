import {
    Button,
    type ButtonProps,
    Modal,
} from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';

// FIXME: make the props consistent with other similar components
// e.g. DropdownMenu
interface Props extends ButtonProps<undefined> {
    heading?: string;
    modalContent: React.ReactNode;
    label?: string;
}

// FIXME: this component should be in `/components`
function InfoModal(props: Props) {
    const {
        heading,
        label,
        modalContent,
        ...otherButtonProps
    } = props;

    const [
        showInfoModal,
        {
            setTrue: setShowInfoModalTrue,
            setFalse: setShowInfoModalFalse,
        },
    ] = useBooleanState(false);

    return (
        <>
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherButtonProps}
                name={undefined}
                onClick={setShowInfoModalTrue}
            >
                {label}
            </Button>
            {showInfoModal && (
                <Modal
                    onClose={setShowInfoModalFalse}
                    heading={heading}
                    size="auto"
                >
                    {modalContent}
                </Modal>
            )}
        </>
    );
}

export default InfoModal;
