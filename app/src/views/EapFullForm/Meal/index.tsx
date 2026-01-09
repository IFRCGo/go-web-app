import {
    Heading,
    InputSection,
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

    return (
        <TabPage>
            <ListView
                layout="block"
            >
                <Heading level={4}>
                    {strings.mealHeading}
                </Heading>
                <InputSection
                    title={strings.mealTitle}
                    tooltip={(
                        <ListView
                            layout="block"
                        >
                            <TextOutput
                                strongLabel
                                label={strings.mealExplanatoryNoteLabel}
                                value={strings.mealExplanatoryNote}
                            />
                            <TextOutput
                                strongLabel
                                label={strings.mealRequiredPointsLabel}
                                value={(
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
                                )}
                            />
                        </ListView>
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
                    />
                </InputSection>
                <InputSection
                    title={strings.mealAttachRelevantFilesTitle}
                    description={strings.mealAttachRelevantFilesDescription}
                >
                    <GoMultiFileInput
                        name="meal_relevant_files"
                        accept=".pdf, .docx, .pptx"
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
            </ListView>
        </TabPage>
    );
}

export default Meal;
