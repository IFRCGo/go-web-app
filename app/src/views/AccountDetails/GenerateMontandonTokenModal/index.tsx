import { useCallback } from 'react';
import {
    Button,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useInputState from '#hooks/useInputState';
import { useLazyRequest } from '#utils/restRequest';

import TokenDetails from '../TokenDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

const MIN_TITLE_LENGTH = 3;

interface Props {
    onClose: () => void;
    onCreate: () => void;
}

function GenerateMontandonTokenModal(props: Props) {
    const { onClose, onCreate } = props;
    const [accepted, { setTrue: setAcceptedTrue }] = useBooleanState(false);
    const strings = useTranslation(i18n);

    const [tokenTitle, setTokenTitle] = useInputState<string | undefined>(undefined);

    const {
        pending: tokenPending,
        response: tokenResponse,
        error: tokenError,
        trigger: triggerGenerateTokenRequest,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/external-token/',
        body: (context: string) => ({
            title: context,
            expire_timestamp: undefined,
        }),
        onSuccess: onCreate,
    });

    const handleAcceptAndGenerateClick = useCallback(
        (title: string | undefined) => {
            if (isDefined(title) && title.length >= MIN_TITLE_LENGTH) {
                setAcceptedTrue();
                triggerGenerateTokenRequest(title);
            }
        },
        [setAcceptedTrue, triggerGenerateTokenRequest],
    );

    return (
        <Modal
            className={styles.generateMontandonTokenModal}
            heading={strings.title}
            onClose={onClose}
            headerDescription={!accepted && resolveToComponent(
                strings.description,
                {
                    termsLink: (
                        <Link
                            to="termsAndConditions"
                            withLinkIcon
                            withUnderline
                        >
                            {strings.termsAndConditionLabel}
                        </Link>
                    ),
                },
            )}
            size="sm"
            contentViewType="vertical"
            spacing="comfortable"
            footerActions={(
                <>
                    {!accepted && (
                        <>
                            <Button
                                name={undefined}
                                onClick={onClose}
                                variant="secondary"
                            >
                                {strings.cancelButtonLabel}
                            </Button>
                            <Button
                                name={tokenTitle}
                                onClick={handleAcceptAndGenerateClick}
                                disabled={isNotDefined(tokenTitle)
                                    || tokenTitle.trim().length < MIN_TITLE_LENGTH}
                            >
                                {strings.acceptButtonLabel}
                            </Button>
                        </>
                    )}
                    {accepted && (
                        <Button
                            name={undefined}
                            onClick={onClose}
                        >
                            {strings.doneButtonLabel}
                        </Button>
                    )}
                </>
            )}
            pending={tokenPending}
            errored={isDefined(tokenError)}
            errorMessage={tokenError?.value.messageForNotification}
        >
            {!accepted && (
                <TextInput
                    name="tokenTitle"
                    label={strings.titleInputLabel}
                    value={tokenTitle}
                    onChange={setTokenTitle}
                    hint={
                        resolveToString(
                            strings.titleInputHint,
                            { minCharacters: MIN_TITLE_LENGTH },
                        )
                    }
                    placeholder={strings.titleInputPlaceholder}
                />
            )}
            {accepted && (
                <>
                    <TokenDetails
                        data={tokenResponse}
                    />
                    <div className={styles.note}>
                        {strings.tokenNote}
                    </div>
                </>
            )}
        </Modal>
    );
}

export default GenerateMontandonTokenModal;
