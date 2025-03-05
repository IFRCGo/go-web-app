import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/FSM/72a3cbe0b29742118ddec07e50dcd372/containers.gif',
                caption: strings.SludgeImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/FSM/b72fbb3ffd184cdbb72cc5b3fb22c8d4/envelopes.gif',
                caption: strings.SludgeImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/FSM/7ff1db3ec9324578bcf1f463ef68f611/5columns.gif',
                caption: strings.SludgeImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/FSM/da7d101649664a37becb4c8ed11c7561/roles_respons.jpg',
                caption: strings.SludgeImageFourCaption,
            },
        ]),
        [
            strings.SludgeImageOneCaption,
            strings.SludgeImageTwoCaption,
            strings.SludgeImageThreeCaption,
            strings.SludgeImageFourCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.faecalSludgeManagement}
            goBackFallbackLink="surgeCatalogueWash"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.washCapacity}
            >
                <div>{strings.washCapacityTextOne}</div>
                <div>{strings.washCapacityTextTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <ul>
                    <li>
                        {strings.emergencyServicesSectionOneA}
                        <br />
                        {strings.emergencyServicesSectionOneB}
                    </li>
                    <ul>
                        <li>{strings.emergencyServicesSectionOneC}</li>
                        <li>{strings.emergencyServicesSectionOneD}</li>
                    </ul>
                    <li>
                        {strings.emergencyServicesSectionTwoA}
                        <br />
                        {strings.emergencyServicesSectionTwoB}
                    </li>
                    <ul>
                        <li>
                            <dl>
                                <dt>{strings.emergencyServicesSectionTwoC}</dt>
                                <dd>{strings.emergencyServicesSectionTwoCC}</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>{strings.emergencyServicesSectionTwoD}</dt>
                                <dd>{strings.emergencyServicesSectionTwoDD}</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>{strings.emergencyServicesSectionTwoE}</dt>
                                <dd>{strings.emergencyServicesSectionTwoEE}</dd>
                            </dl>
                        </li>
                    </ul>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForItemOne}</div>
                <div>{strings.designedForItemTwo}</div>
                <ul>
                    <li>{strings.designedForItemTwoA}</li>
                    <li>{strings.designedForItemTwoB}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnel}
            >
                <dl>
                    <dt>{strings.totalPersonnelHeader}</dt>
                    <br />
                    <dd>
                        <TextOutput
                            value={strings.totalPersonnelValue}
                            label={strings.totalPersonnelLabel}
                            strongLabel
                        />
                        <ul>
                            <li>{strings.totalPersonnelItemA}</li>
                            <li>{strings.totalPersonnelItemB}</li>
                            <li>{strings.totalPersonnelItemC}</li>
                            <li>{strings.totalPersonnelItemD}</li>
                            <li>{strings.totalPersonnelItemE}</li>
                            <li>{strings.totalPersonnelItemF}</li>
                        </ul>
                    </dd>
                </dl>
                <div>{strings.personnelFooterA}</div>
                <div>{strings.personnelFooterB}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specification}
            >
                <TextOutput
                    label={strings.specificationWeightLabel}
                    value={strings.specificationWeightValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.specificationVolumeLabel}
                    value={strings.specificationVolumeValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.specificationCostLabel}
                    value={strings.specificationCostValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.specificationTemperatureLabel}
                    value={strings.specificationTemperatureValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.specificationModularityLabel}
                    value={(
                        <ul>
                            <li>{strings.specificationModularityValueA}</li>
                            <li>{strings.specificationModularityValueB}</li>
                            <li>{strings.specificationModularityValueC}</li>
                        </ul>
                    )}
                    strongLabel
                />
                <div>{strings.specificationModularityFooter}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specificationNSLabel}
            >
                <div>{strings.specificationNSDescription}</div>
                <ul>
                    <li>{strings.specificationNSItemA}</li>
                    <li>{strings.specificationNSItemB}</li>
                    <li>{strings.specificationNSItemC}</li>
                    <li>{strings.specificationNSItemD}</li>
                    <li>{strings.specificationNSItemE}</li>
                    <li>{strings.specificationNSItemF}</li>
                    <li>{strings.specificationNSItemG}</li>
                    <li>{strings.specificationNSItemH}</li>
                    <li>{strings.specificationNSItemI}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.variation}
            >
                <div>{strings.variationTextOne}</div>
                <div>
                    {strings.variationTextTwo}
                    <ul>
                        <li>{strings.variationTextTwoA}</li>
                        <li>{strings.variationTextTwoB}</li>
                    </ul>
                </div>
                <div>{strings.variationTextThree}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWashSludge';
