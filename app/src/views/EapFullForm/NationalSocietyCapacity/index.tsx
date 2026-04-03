import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InputSection,
    Label,
    ListView,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';

import { charLimits } from '../common';
import EAPSourceInformationInput, { type SourceInformationFormFields } from '../EAPSourceInformationInput';
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

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<
        'ns_capacity_source_of_information',
        SourceInformationFormFields
    >('ns_capacity_source_of_information', setFieldValue);

    const handleSourcesInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'ns_capacity_source_of_information' as const,
        );
    }, [setFieldValue]);

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
                        <ExplanatoryNote
                            heading={strings.capacityHeading}
                            ariaLabel={strings.capacityHeading}
                            title={strings.capacityHeading}
                            content={(
                                <Description>
                                    {strings.capacityHeadingTooltip}
                                </Description>
                            )}
                        />
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
                            maxLength={charLimits.operational_administrative_capacity}
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
                            maxLength={charLimits.strategies_and_plans}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.capacityFinancialCapacityTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.capacityFinancialCapacityTitle}
                                ariaLabel={strings.capacityFinancialCapacityTitle}
                                title={strings.capacityFinancialCapacityTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.capacityExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.capacityExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.capacityRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.capacityFinancialDescription}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.capacityFinancialDescription}
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
                            maxLength={charLimits.advance_financial_capacity}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.capacityNationalRelevantFilesTitle}
                        description={strings.capacityNationalRelevantFilesDescription}
                    >
                        <GoMultiFileInput
                            name="capacity_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
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
                    <InputSection
                        title={strings.capacitySourcesInformationTitle}
                        description={strings.capacitySourcesInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(
                                error?.ns_capacity_source_of_information,
                            )}
                        />
                        {value?.ns_capacity_source_of_information?.map(
                            (source, index) => (
                                <EAPSourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourceInformationChange}
                                    onRemove={onSourceInformationRemove}
                                    error={getErrorObject(
                                        error?.ns_capacity_source_of_information,
                                    )}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            ),
                        )}
                        <Button
                            name={undefined}
                            onClick={handleSourcesInformationAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addNewCapacitySourceButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default NationalSocietyCapacity;
