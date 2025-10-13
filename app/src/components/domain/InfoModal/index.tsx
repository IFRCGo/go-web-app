import {
    Button,
    type ButtonProps,
    IconButton,
    Modal,
} from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';

type IconButtonProps = {
    icon: React.ReactNode;
    ariaLabel: string;
    label?: never;
    title: string;
}

type LabelButtonProps = {
    icon?: never;
    ariaLabel?: string;
    label?: string;
}

type ButtonTypeProps = IconButtonProps | LabelButtonProps;

// FIXME: make the props consistent with other similar components
// e.g. DropdownMenu
interface BaseProps extends ButtonProps<undefined> {
    heading?: string;
    modalContent: React.ReactNode;
}

type Props = BaseProps & ButtonTypeProps;

// FIXME: this component should be in `/components`
function InfoModal(props: Props) {
    const {
        heading,
        label,
        modalContent,
        ariaLabel,
        title,
        icon,
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
            {icon ? (
                <IconButton
                    name={undefined}
                    onClick={setShowInfoModalTrue}
                    ariaLabel={ariaLabel}
                    title={title}
                >
                    {icon}
                </IconButton>
            ) : (
                <Button
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherButtonProps}
                    name={undefined}
                    onClick={setShowInfoModalTrue}
                >
                    {label}
                </Button>
            )}
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
