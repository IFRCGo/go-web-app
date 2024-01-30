import { useCallback } from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    type Error,
    type EntriesAsList,
    getErrorObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import NumberInput from '#components/NumberInput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';

import SourceInformationInput from '#components/domain/SourceInformationInput';
import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';
import {
    TYPE_IMMINENT,
    TYPE_ASSESSMENT,
    ONSET_SUDDEN,
} from '../common';
import { type PartialFinalReport } from '../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PartialFinalReport;
type SourceInformationFormFields = NonNullable<PartialFinalReport['source_information']>[number];
interface Props {
    value: Value;
    setFieldValue: (...entries: EntriesAsList<Value>) => void;
    error: Error<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

const totalPopulationRiskImminentLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const totalPeopleAffectedSlowSuddenLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleTargetedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';
const peopleInNeedLink = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FHum%20Pop%20Definitions%20for%20DREF%20Form%5F21072022%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF&p=true&ga=1';

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

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<'source_information', SourceInformationFormFields>(
        'source_information',
        setFieldValue,
    );

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => (
                [...(oldValue ?? []), newSourceInformationItem]
            ),
            'source_information' as const,
        );
    }, [setFieldValue]);

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
                    title={strings.numericDetails}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        name="number_of_people_affected"
                        label={value?.type_of_dref === TYPE_IMMINENT ? (
                            <>
                                {strings.drefFormRiskPeopleLabel}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={totalPopulationRiskImminentLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        ) : (
                            <>
                                {strings.drefFormPeopleAffected}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={totalPeopleAffectedSlowSuddenLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        value={value?.number_of_people_affected}
                        onChange={setFieldValue}
                        error={error?.number_of_people_affected}
                        hint={(
                            value?.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormPeopleAffectedDescriptionImminent
                                : strings.drefFormPeopleAffectedDescriptionSlowSudden
                        )}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={(
                            <>
                                {
                                    value?.type_of_dref === TYPE_IMMINENT
                                        ? strings.drefFormEstimatedPeopleInNeed
                                        : strings.drefFormPeopleInNeed
                                }
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={peopleInNeedLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        name="people_in_need"
                        value={value?.people_in_need}
                        onChange={setFieldValue}
                        error={error?.people_in_need}
                        hint={(
                            value?.type_of_dref === TYPE_IMMINENT
                                ? strings.drefFormPeopleInNeedDescriptionImminent
                                : strings.drefFormPeopleInNeedDescriptionSlowSudden
                        )}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={(
                            <>
                                {strings.finalReportPeopleTargeted}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={peopleTargetedLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        name="number_of_people_targeted"
                        value={value.number_of_people_targeted}
                        onChange={setFieldValue}
                        error={error?.number_of_people_targeted}
                        hint={strings.drefFormPeopleTargetedDescription}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={(
                            <>
                                {strings.drefFormPeopleTargeted}
                                <Link
                                    title={strings.drefFormClickEmergencyResponseFramework}
                                    href={peopleTargetedLink}
                                    external
                                >
                                    <WikiHelpSectionLineIcon />
                                </Link>
                            </>
                        )}
                        name="num_assisted"
                        value={value?.num_assisted}
                        onChange={setFieldValue}
                        error={error?.num_assisted}
                        hint={strings.drefFormPeopleTargetedDescription}
                        disabled={disabled}
                    />
                    {/* NOTE: Empty div to preserve the layout */}
                    <div />
                </InputSection>
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
                        label={strings.drefFinalReportFormSelectImages}
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
                <InputSection
                    title={strings.drefFormSourceInformationTitle}
                    description={strings.drefFormSourceInformationDescription}
                >
                    <NonFieldError error={getErrorObject(error?.source_information)} />
                    {value.source_information?.map((source, index) => (
                        <SourceInformationInput
                            key={source.client_id}
                            index={index}
                            value={source}
                            onChange={onSourceInformationChange}
                            onRemove={onSourceInformationRemove}
                            error={getErrorObject(error?.source_information)}
                            disabled={disabled}
                        />
                    ))}
                    <Button
                        className={styles.actions}
                        name={undefined}
                        onClick={handleSourceInformationAdd}
                        variant="secondary"
                        disabled={disabled}
                    >
                        {strings.drefFormSourceInformationAddButton}
                    </Button>
                </InputSection>
            </Container>
        </div>
    );
}

export default EventDetail;
