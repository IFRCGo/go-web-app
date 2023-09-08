import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import Image from '#components/Image';
import useTranslation from '#hooks/useTranslation';
import compositionImage from '#assets/images/surge-im-composition.jpg';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.iMCompositionTitle}
            goBackFallbackLink="catalogueInformationManagement"
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
