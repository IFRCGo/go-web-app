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
function NationalSocietyCapacity(props: Props) {
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
                        title={strings.eapFullFormOperationalTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormOperationalDescription1}</li>
                                <li>{strings.eapFullFormOperationalDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormNationalCapacityDescriptionLabel}
                            name="operational_administrative_capacity"
                            value={value?.operational_administrative_capacity}
                            error={error?.operational_administrative_capacity}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormStrategiesPlansTitle}
                        description={strings.eapFullFormStrategiesPlansDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormNationalCapacityDescriptionLabel}
                            name="strategies_and_plans"
                            value={value?.strategies_and_plans}
                            error={error?.strategies_and_plans}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormFinancialCapacityTitle}
                        description={strings.eapFullFormFinancialCapacityDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormNationalCapacityDescriptionLabel}
                            name="advance_financial_capacity"
                            value={value?.advance_financial_capacity}
                            error={error?.advance_financial_capacity}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormNationalRelevantFilesTitle}
                        description={strings.eapFullFormNationalRelevantFilesDescription}
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
                            useCurrentLanguageForMutation
                        >
                            {strings.eapFullFormNationalRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default NationalSocietyCapacity;
