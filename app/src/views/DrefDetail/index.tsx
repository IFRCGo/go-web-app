import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Container>
            <ListView
                layout="block"
            >
                <SurgeContentContainer
                    heading={strings.drefIntroHeading}
                >
                    <div>{strings.drefIntroDetailOne}</div>
                    <div>{strings.drefIntroDetailTwo}</div>
                </SurgeContentContainer>
                <SurgeContentContainer
                    heading={strings.drefProcessHeading}
                >
                    <div>{strings.drefProcessSubHeading}</div>
                    <ul>
                        <li>
                            {strings.drefProcessListOne}
                        </li>
                        <li>
                            {strings.drefProcessListTwo}
                        </li>
                    </ul>
                    <div>
                        {strings.drefProcessDetailOne}
                    </div>
                    <div>
                        {strings.drefProcessDetailTwo}
                    </div>
                </SurgeContentContainer>
                <Link
                    to="newDrefApplicationForm"
                    withUnderline
                >
                    {strings.drefDrefApplication}
                </Link>
            </ListView>
        </Container>
    );
}

Component.displayName = 'DrefDetail';
