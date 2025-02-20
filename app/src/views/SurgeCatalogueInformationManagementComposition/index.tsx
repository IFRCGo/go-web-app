import { Image } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import compositionImage from '#assets/images/surge-im-composition.jpg';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.iMCompositionTitle}
            goBackFallbackLink="surgeCatalogueInformationManagement"
        >
            <div>{strings.iMCompositionDetail}</div>
            <ul>
                <li>{strings.iMCompositionItemOne}</li>
                <li>{strings.iMCompositionItemTwo}</li>
                <li>{strings.iMCompositionItemThree}</li>
                <li>{strings.iMCompositionItemFour}</li>
                <li>{strings.iMCompositionItemFive}</li>
                <li>{strings.iMCompositionItemSix}</li>
            </ul>
            <div>{strings.iMCompositionDescription}</div>
            <Image
                src={compositionImage}
                alt={strings.iMCompositionTitle}
            />
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationManagementComposition';
