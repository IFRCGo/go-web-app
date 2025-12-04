import {
    Container,
    InputSection,
    ListView,
    TextArea,
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
}

function Meal(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    return (
        <TabPage>
            <Container>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.eapFullFormMealTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormMealDescription1}</li>
                                <ul>
                                    <li>{strings.eapFullFormMealDescription2}</li>
                                    <li>{strings.eapFullFormMealDescription3}</li>
                                </ul>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormMealDescriptionLabel}
                            name="meal"
                            value={value?.meal}
                            error={error?.meal}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormMealAttachRelevantFilesTitle}
                        description={strings.eapFullFormMealAttachRelevantFilesDescription}
                    >
                        <GoMultiFileInput
                            name="meal_relevant_files"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value?.meal_relevant_files}
                            error={getErrorString(error?.meal_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            useCurrentLanguageForMutation
                        >
                            {strings.eapFullFormMealAttachRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default Meal;
