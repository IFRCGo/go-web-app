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
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    readOnly?: boolean;
}

function Meal(props: Props) {
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
        'meal_source_of_information',
        SourceInformationFormFields
    >('meal_source_of_information', setFieldValue);

    const handleSourcesInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'meal_source_of_information' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.mealSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.mealCriteriaIntroduction1}
                                </Label>
                                <Description>
                                    <ol>
                                        <li>{strings.mealCriteriaIntroduction11}</li>
                                        <li>{strings.mealCriteriaIntroduction12}</li>
                                        <li>{strings.mealCriteriaIntroduction13}</li>
                                    </ol>
                                </Description>
                            </ListView>
                            <Description>
                                {strings.mealCriteriaComment1}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                variant="form"
                heading={strings.mealHeading}
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.mealTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.mealTitle}
                                ariaLabel={strings.mealTitle}
                                title={strings.mealTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.mealExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.mealExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.mealRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.mealDescription1}</li>
                                                    <ul>
                                                        <li>{strings.mealDescription11}</li>
                                                        <li>{strings.mealDescription12}</li>
                                                        <li>{strings.mealDescription13}</li>
                                                        <li>{strings.mealDescription14}</li>
                                                    </ul>
                                                    <li>{strings.mealDescription2}</li>
                                                    <li>{strings.mealDescription3}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.mealDescription1}</li>
                                <ul>
                                    <li>{strings.mealDescription11}</li>
                                    <li>{strings.mealDescription12}</li>
                                    <li>{strings.mealDescription13}</li>
                                </ul>
                                <li>{strings.mealDescription2}</li>
                                <li>{strings.mealDescription3}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.mealDescriptionLabel}
                            name="meal"
                            value={value?.meal}
                            error={error?.meal}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.meal}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.mealAttachRelevantFilesTitle}
                        description={strings.mealAttachRelevantFilesDescription}
                    >
                        <GoMultiFileInput
                            name="meal_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value.meal_relevant_files}
                            error={getErrorString(error?.meal_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                        >
                            {strings.mealAttachRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.mealSourcesInformationTitle}
                        description={strings.mealSourcesInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(
                                error?.meal_source_of_information,
                            )}
                        />
                        {value?.meal_source_of_information?.map(
                            (source, index) => (
                                <EAPSourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourceInformationChange}
                                    onRemove={onSourceInformationRemove}
                                    error={getErrorObject(
                                        error?.meal_source_of_information,
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
                            {strings.addNewMealButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Meal;
