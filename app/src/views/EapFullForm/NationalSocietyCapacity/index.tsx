import {
    Container,
    Description,
    InfoPopup,
    InputSection,
    Label,
    ListView,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import TabPage from '#components/TabPage';

import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
}
function NationalSocietyCapacity(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.capacitySectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.capacityCriteriaIntroduction11}
                                </Label>
                                <Label>
                                    {strings.capacityCriteriaIntroduction12}
                                </Label>
                            </ListView>
                            <Description>
                                {strings.capacityCriteriaComment1}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={(
                    <ListView>
                        {strings.capacityHeading}
                        <InfoPopup description={strings.capacityHeadingTooltip} />
                    </ListView>
                )}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.capacityOperationalTitle}
                        description={(
                            <ul>
                                <li>{strings.capacityOperationalDescription1}</li>
                                <li>{strings.capacityOperationalDescription2}</li>
                                <li>{strings.capacityOperationalDescription3}</li>
                                <li>{strings.capacityOperationalDescription4}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.capacityDescriptionLabel}
                            name="operational_administrative_capacity"
                            value={value?.operational_administrative_capacity}
                            error={error?.operational_administrative_capacity}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.capacityStrategiesPlansTitle}
                        description={strings.capacityStrategiesPlansDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.capacityDescriptionLabel}
                            name="strategies_and_plans"
                            value={value?.strategies_and_plans}
                            error={error?.strategies_and_plans}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.capacityFinancialCapacityTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.capacityExplanatoryNoteLabel}
                                    value={strings.capacityExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.capacityRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.capacityFinancialCapacityDescription}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={strings.capacityFinancialCapacityDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.capacityDescriptionLabel}
                            name="advance_financial_capacity"
                            value={value?.advance_financial_capacity}
                            error={error?.advance_financial_capacity}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.capacityNationalRelevantFilesTitle}
                        description={strings.capacityNationalRelevantFilesDescription}
                    >
                        <GoMultiFileInput
                            name="capacity_relevant_files"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value?.capacity_relevant_files}
                            error={getErrorString(error?.capacity_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                        >
                            {strings.capacityNationalRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default NationalSocietyCapacity;
