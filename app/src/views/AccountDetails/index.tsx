import {
    useCallback,
    useState,
} from 'react';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import useUserMe from '#hooks/domain/useUserMe';

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
