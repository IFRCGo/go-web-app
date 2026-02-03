import { useCallback } from 'react';
import { ShareLineIcon } from '@ifrc-go/icons';
import {
    type ButtonProps,
    TableActions,
} from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';

import EapShareModal from '#components/domain/EapShareModal';
import DropdownMenuItem from '#components/DropdownMenuItem';

export interface Props {
    id: number;
}

function EapShareActions(props: Props) {
    const { id } = props;

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
                    >
                        Share
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
