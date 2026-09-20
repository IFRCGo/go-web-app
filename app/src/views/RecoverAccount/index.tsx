import { useCallback } from 'react';
import {
    Button,
    Container,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import RecoverAccountForm from '#components/domain/RecoverAccountForm';
import useRecoverAccountForm from '#components/domain/RecoverAccountForm/useRecoverAccountForm';
import Page from '#components/Page';
import useRouting from '#hooks/useRouting';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { navigate } = useRouting();

    const handleRecoverAccountSuccess = useCallback(
        () => {
            navigate('login');
        },
        [navigate],
    );

    const {
        value,
        error,
        setFieldValue,
        pending,
        handleFormSubmit,
    } = useRecoverAccountForm({ onSuccess: handleRecoverAccountSuccess });

    return (
        <Page
            title={strings.pageTitle}
            heading={strings.pageHeading}
        >
            <Container
                spacing="2xl"
                headerDescription={strings.pageDescription}
                withCenteredContent
            >
                <form onSubmit={handleFormSubmit}>
                    <RecoverAccountForm
                        spacing="2xl"
                        value={value}
                        error={error}
                        setFieldValue={setFieldValue}
                        disabled={pending}
                        actions={(
                            <ListView>
                                <Button
                                    name={undefined}
                                    type="submit"
                                    disabled={pending}
                                >
                                    {strings.submitButtonLabel}
                                </Button>
                            </ListView>
                        )}
                    />
                </form>
            </Container>
        </Page>
    );
}

Component.displayName = 'RecoverAccount';
