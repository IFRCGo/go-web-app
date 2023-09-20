import { useState, useCallback } from 'react';
import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { PencilFillIcon } from '@ifrc-go/icons';

import useUserMe from '#hooks/domain/useUserMe';
import Container from '#components/Container';
import Button from '#components/Button';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import ChangePasswordModal from './ChangePassword';
import EditAccountInfo from './EditAccountInfo';
import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const meResponse = useUserMe();

    const onEditProfileCancel = useCallback(() => {
        setShowEditProfileModal(false);
    }, []);

    const onCancelPasswordChange = useCallback(() => {
        setShowChangePasswordModal(false);
    }, []);

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
            >
                <div className={styles.infoListContainer}>
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
                        value={meResponse?.profile?.org_type}
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
                </div>
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
        </div>
    );
}

Component.displayName = 'AccountInformation';
