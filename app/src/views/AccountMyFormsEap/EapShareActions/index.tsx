import { useCallback } from 'react';
import { ShareLineIcon } from '@ifrc-go/icons';
import {
    type ButtonProps,
    TableActions,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import EapShareModal from '#components/domain/EapShareModal';
import DropdownMenuItem from '#components/DropdownMenuItem';

import i18n from './i18n.json';

export interface Props {
    id: number;
    disabled?: boolean;
}

function EapShareActions(props: Props) {
    const { id, disabled } = props;

    const strings = useTranslation(i18n);

    const [
        showShareModal,
        { setTrue: setShowShareModalTrue, setFalse: setShowShareModalFalse },
    ] = useBooleanState(false);

    const handleShareClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(() => {
        setShowShareModalTrue();
    }, [setShowShareModalTrue]);

    return (
        <>
            <TableActions
                extraActions={(
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        before={<ShareLineIcon />}
                        onClick={handleShareClick}
                        disabled={disabled}
                    >
                        {strings.shareDropDownLabel}
                    </DropdownMenuItem>
                )}
            />
            {showShareModal && (
                <EapShareModal
                    onCancel={setShowShareModalFalse}
                    onSuccess={setShowShareModalFalse}
                    eapId={id}
                />
            )}
        </>
    );
}

export default EapShareActions;
