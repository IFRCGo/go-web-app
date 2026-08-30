import {
    useCallback,
    useState,
} from 'react';
import {
    AddLineIcon,
    DeleteBinTwoLineIcon,
    PencilLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useUserMe from '#hooks/domain/useUserMe';
import useAlert from '#hooks/useAlert';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import SubscriptionModal from './SubscriptionModal';

import i18n from './i18n.json';

function EmailPreferences() {
    const user = useUserMe();
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        response: subscriptionListResponse,
        pending: subscriptionListPending,
        retrigger: refetchSubscriptionList,
    } = useRequest<'/api/v2/alert-subscription/'>({
        url: '/api/v2/alert-subscription/',
        method: 'GET',
    });

    const {
        pending: subscriptionDeletePending,
        trigger: deleteSubscription,
    } = useLazyRequest({
        method: 'DELETE',
        url: '/api/v2/alert-subscription/{id}/',
        pathVariables: ({ id }) => ({ id }),
        onSuccess: () => {
            refetchSubscriptionList();
            alert.show(
                strings.subscriptionDeletedSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                strings.subscriptionDeletedFailureMessage,
                { variant: 'danger' },
            );
        },

    });

    const subscriptionList = subscriptionListResponse?.results;

    const [subscriptionModalVisible, {
        setTrue: showSubscriptionModal,
        setFalse: hideSubscriptionModal,
    }] = useBooleanState(false);

    const [activeSubscriptionId, setActiveSubscriptionId] = useState<number | undefined>();

    const handleSubscriptionModalClose = useCallback(() => {
        refetchSubscriptionList();
        setActiveSubscriptionId(undefined);
        hideSubscriptionModal();
    }, [refetchSubscriptionList, hideSubscriptionModal]);

    const handleSubscriptionEditClick = useCallback((subId: number) => {
        showSubscriptionModal();
        setActiveSubscriptionId(subId);
    }, [setActiveSubscriptionId, showSubscriptionModal]);

    const handleSubscriptionDelete = useCallback((subId: number) => {
        deleteSubscription({ id: subId });
    }, [deleteSubscription]);

    const handleSubscriptionAddClick = useCallback(() => {
        showSubscriptionModal();
        setActiveSubscriptionId(undefined);
    }, [setActiveSubscriptionId, showSubscriptionModal]);

    return (
        <>
            <Container
                heading={strings.heading}
                headerDescription={strings.description}
                pending={subscriptionListPending}
                empty={isNotDefined(subscriptionList) || subscriptionList?.length === 0}
                emptyMessage={strings.emptyMessage}
                headerActions={(
                    <Button
                        name={undefined}
                        onClick={handleSubscriptionAddClick}
                        title={strings.addSubscriptionLabel}
                        before={<AddLineIcon />}
                    >
                        {strings.addSubscriptionLabel}
                    </Button>
                )}
                withHeaderBorder
            >
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    {subscriptionList?.map((item) => (
                        <Container
                            key={item.id}
                            heading={item.title}
                            withDarkBackground
                            withPadding
                            headerActions={(
                                <>
                                    <Button
                                        name={item.id}
                                        onClick={handleSubscriptionEditClick}
                                        title={strings.editSubscriptionTitle}
                                        before={<PencilLineIcon />}
                                        styleVariant="action"
                                        colorVariant="primary"
                                    >
                                        {strings.editSubscriptionLabel}
                                    </Button>
                                    <ConfirmButton
                                        name={item.id}
                                        styleVariant="action"
                                        colorVariant="primary"
                                        title={strings.deleteSubscriptionTitle}
                                        onConfirm={handleSubscriptionDelete}
                                        // eslint-disable-next-line max-len
                                        confirmHeading={strings.deleteSubscriptionConfirmationHeading}
                                        // eslint-disable-next-line max-len
                                        confirmMessage={strings.deleteSubscriptionConfirmationMessage}
                                        before={<DeleteBinTwoLineIcon />}
                                        disabled={subscriptionDeletePending}
                                    >
                                        {strings.deleteSubscriptionLabel}
                                    </ConfirmButton>
                                </>
                            )}
                            headingLevel={5}
                            withHeaderBorder
                            spacing="sm"
                        >
                            <ListView
                                layout="grid"
                                withSpacingOpticalCorrection
                                spacing="xs"
                            >
                                <TextOutput
                                    label={strings.alertFrequencies}
                                    value={isDefined(item.alert_per_day)
                                        ? item.alert_per_day_display
                                        : strings.unlimitedOption}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.regions}
                                    value={item.regions_detail.map((c) => c.name).join(', ')}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.countries}
                                    value={item.countries_detail.map((c) => c.name).join(', ')}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.disasters}
                                    value={item.hazard_types_detail.map((c) => c.name).join(', ')}
                                    strongLabel
                                />
                            </ListView>
                        </Container>
                    ))}
                </ListView>
            </Container>
            {subscriptionModalVisible && isDefined(user?.id) && (
                <SubscriptionModal
                    onClose={handleSubscriptionModalClose}
                    subscriptionId={activeSubscriptionId}
                    userId={user.id}
                />
            )}
        </>
    );
}

export default EmailPreferences;
