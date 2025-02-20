import {
    useCallback,
    useState,
} from 'react';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Pager,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useUserMe from '#hooks/domain/useUserMe';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';

import ChangePasswordModal from './ChangePassword';
import EditAccountInfo from './EditAccountInfo';
import GenerateMontandonTokenModal from './GenerateMontandonTokenModal';
import TokenDetails from './TokenDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

const TOKEN_PAGE_SIZE = 12;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [
        showGenerateMontandonTokenModal,
        {
            setTrue: setShowGenerateMontandonTokenModalTrue,
            setFalse: setShowGenerateMontandonTokenModalFalse,
        },
    ] = useBooleanState(false);

    const meResponse = useUserMe();
    const { api_profile_org_types } = useGlobalEnums();
    const orgTypeMap = listToMap(
        api_profile_org_types,
        ({ key }) => key,
    );

    const onEditProfileCancel = useCallback(() => {
        setShowEditProfileModal(false);
    }, []);

    const onCancelPasswordChange = useCallback(() => {
        setShowChangePasswordModal(false);
    }, []);

    const {
        limit,
        offset,
        page,
        setPage,
    } = useFilterState({
        filter: {},
        pageSize: TOKEN_PAGE_SIZE,
    });

    const {
        pending: montandonTokenPending,
        response: montandonTokenResponse,
        retrigger: refetchMontandonTokenList,
    } = useRequest({
        url: '/api/v2/external-token/',
        query: {
            limit,
            offset,
        },
        preserveResponse: true,
    });

    return (
        <div className={styles.accountInformation}>
            <Container
                heading={strings.accountInformationHeading}
                withHeaderBorder
                actions={(
                    <>
                        <Button
                            name
                            className={styles.changePasswordButton}
                            onClick={setShowChangePasswordModal}
                            variant="secondary"
                        >
                            {strings.changePasswordButtonLabel}
                        </Button>
                        <Button
                            name
                            icons={(<PencilFillIcon />)}
                            onClick={setShowEditProfileModal}
                            variant="secondary"
                            disabled={isNotDefined(meResponse)}
                        >
                            {strings.editProfileButtonLabel}
                        </Button>
                    </>
                )}
                contentViewType="grid"
                numPreferredGridContentColumns={3}
            >
                <TextOutput
                    label={strings.usernameLabel}
                    value={meResponse?.username}
                    strongLabel
                />
                <TextOutput
                    label={strings.fullNameLabel}
                    strongLabel
                    value={
                        // FIXME: use helper from utils
                        [meResponse?.first_name, meResponse?.last_name]
                            .filter(isTruthyString).join(' ')
                    }
                />
                <TextOutput
                    label={strings.emailLabel}
                    value={meResponse?.email}
                    strongLabel
                />
                <TextOutput
                    label={strings.phoneNumberLabel}
                    value={meResponse?.profile?.phone_number}
                    strongLabel
                />
                <TextOutput
                    strongLabel
                    label={strings.cityLabel}
                    value={meResponse?.profile?.city}
                />
                <TextOutput
                    label={strings.organizationLabel}
                    value={meResponse?.profile?.org}
                    strongLabel
                />
                <TextOutput
                    label={strings.organizationTypeLabel}
                    value={
                        isDefined(meResponse?.profile.org_type)
                            ? orgTypeMap?.[meResponse?.profile?.org_type]?.value
                            : undefined
                    }
                    strongLabel
                />
                <TextOutput
                    label={strings.departmentLabel}
                    value={meResponse?.profile?.department}
                    strongLabel
                />
                <TextOutput
                    label={strings.positionLabel}
                    value={meResponse?.profile?.position}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.externalConnectionsTitle}
                headerDescription={strings.externalConnectionsDescription}
                withHeaderBorder
                contentViewType="vertical"
            >
                <Container
                    heading={strings.externalConnectionMontandonTitle}
                    headerDescription={(
                        <>
                            {strings.externalConnectionMontandonDescription}
                            &nbsp;
                            <Link
                                external
                                href="https://docs.google.com/document/d/1USM6IQwBB1jUuyIHe_Bmmc0_gTFibzxBwZ9Oy4YiYx0/edit?usp=sharing"
                                withLinkIcon
                                withUnderline
                            >
                                {strings.viewMoreDetailsLabel}
                            </Link>
                        </>
                    )}
                    headingLevel={4}
                    actions={(
                        <Button
                            name={undefined}
                            onClick={setShowGenerateMontandonTokenModalTrue}
                        >
                            {strings.generateNewTokenLabel}
                        </Button>
                    )}
                    pending={montandonTokenPending}
                    contentViewType="grid"
                    numPreferredGridContentColumns={3}
                    footerActions={isDefined(montandonTokenResponse)
                        && isDefined(montandonTokenResponse.count)
                        && (
                            <Pager
                                activePage={page}
                                itemsCount={montandonTokenResponse.count}
                                maxItemsPerPage={TOKEN_PAGE_SIZE}
                                onActivePageChange={setPage}
                            />
                        )}
                    overlayPending
                >
                    {/* FIXME: use list */}
                    {montandonTokenResponse?.results?.map(
                        (tokenResponse, i) => (
                            <TokenDetails
                                // NOTE: id should be provided from the server
                                // eslint-disable-next-line react/no-array-index-key
                                key={i}
                                className={styles.tokenDetails}
                                data={tokenResponse}
                            />
                        ),
                    )}
                </Container>
            </Container>
            {showEditProfileModal && (
                <EditAccountInfo
                    userDetails={meResponse}
                    handleModalCloseButton={onEditProfileCancel}
                />
            )}
            {showChangePasswordModal && (
                <ChangePasswordModal
                    handleModalCloseButton={onCancelPasswordChange}
                />
            )}
            {showGenerateMontandonTokenModal && (
                <GenerateMontandonTokenModal
                    onClose={setShowGenerateMontandonTokenModalFalse}
                    onCreate={refetchMontandonTokenList}
                />
            )}
        </div>
    );
}

Component.displayName = 'AccountInformation';
