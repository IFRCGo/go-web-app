import {
    type Error,
    type EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import useTranslation from '#hooks/useTranslation';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import {
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
    ONSET_SUDDEN,
} from '../common';
import { type PartialFinalReport } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialFinalReport;
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function EventDetail(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: formError,
        setFieldValue,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    return (
        <div className={styles.eventDetail}>
            <Container
                heading={strings.drefFormDescriptionEvent}
            >
                {value.type_of_dref === TYPE_IMMINENT ? (
                    <InputSection
                        title={strings.drefFormApproximateDateOfImpact}
                    >
                        <TextArea
                            name="event_text"
                            value={value.event_text}
                            onChange={setFieldValue}
                            error={error?.event_text}
                            disabled={disabled}
                        />
                    </InputSection>
                ) : (
                    <InputSection
                        title={(
                            value.type_of_onset === ONSET_SUDDEN
                                ? strings.drefFormEventDate
                                : strings.drefFormSlowEventDate
                        )}
                    >
                        <DateInput
                            name="event_date"
                            value={value.event_date}
                            onChange={setFieldValue}
                            error={error?.event_date}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
                <InputSection
                    title={
                        value.type_of_dref !== TYPE_IMMINENT
                            ? strings.drefFormWhatWhereWhen
                            : strings.drefFormImminentDisaster
                    }
                >
                    <TextArea
                        name="event_description"
                        onChange={setFieldValue}
                        value={value.event_description}
                        error={error?.event_description}
                        disabled={disabled}
                    />
                </InputSection>

                <InputSection
                    title={strings.drefFormUploadPhotos}
                    description={strings.drefFormUploadPhotosLimitation}
                    contentSectionClassName={styles.imageInputContent}
                >
                    <MultiImageWithCaptionInput
                        // FIXME: use translation
                        label="Select images"
                        url="/api/v2/dref-files/multiple/"
                        name="images_file"
                        value={value.images_file}
                        onChange={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={getErrorObject(error?.images_file)}
                        disabled={disabled}
                    />
                </InputSection>
                {/* FIXME: The logic is not present in Final Form */}
                {value.type_of_dref !== TYPE_ASSESSMENT && (
                    <InputSection
                        title={strings.drefFormScopeAndScaleEvent}
                        description={strings.drefFormScopeAndScaleDescription}
                    >
                        <TextArea
                            name="event_scope"
                            onChange={setFieldValue}
                            value={value.event_scope}
                            error={error?.event_scope}
                            disabled={disabled}
                        />
                    </InputSection>
                )}
            </Container>
        </div>
    );
}

export default EventDetail;
