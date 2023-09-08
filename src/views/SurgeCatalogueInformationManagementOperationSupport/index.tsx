import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import Link from '#components/Link';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.iMOperationSupportTitle}
            goBackFallbackLink="surgeCatalogueInformationManagement"
        >
            <div>{strings.iMOperationSupportDetail}</div>
            <ul>
                <li>{strings.iMOperationSupportDetailItemOne}</li>
                <li>{strings.iMOperationSupportDetailItemTwo}</li>
                <li>{strings.iMOperationSupportDetailItemThree}</li>
            </ul>
            <div>
                {resolveToComponent(
                    strings.iMOperationSupportDescription,
                    {
                        link: (
                            <Link
                                to="https://ifrcgoproject.medium.com/information-saves-lives-scaling-data-analytics-in-the-ifrc-network-fd3686718f9c"
                                withUnderline
                                withExternalLinkIcon
                                external
                            >
                                {strings.iMOperationSupportDescriptionLink}
                            </Link>
                        ),
                    },
                )}
            </div>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationManagementOperationSupport';
