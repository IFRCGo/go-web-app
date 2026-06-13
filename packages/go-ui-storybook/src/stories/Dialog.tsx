import {
    Dialog as PureDialog,
    DialogProps as PureDialogProps,
} from '@ifrc-go/ui';

type DialogProps = PureDialogProps

function Dialog(props: DialogProps) {
    return (
        <PureDialog {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Dialog;
