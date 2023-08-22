import {
    useCallback,
    type SetStateAction,
    type Dispatch,
} from 'react';
import {
    randomString,
} from '@togglecorp/fujs';
import {
    useFormArray,
    getErrorObject,
    type EntriesAsList,
    type Error,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import RichTextArea from '#components/parked/RichTextArea';
import useTranslation from '#hooks/useTranslation';
import TextInput from '#components/TextInput';
import Button from '#components/Button';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';

import i18n from './i18n.json';
import ReferenceInput from './ReferenceInput';
import CountryProvinceInput from './CountryProvinceInput';
import MultiImageWithCaptionInput from './MultiImageWithCaptionInput';
import {
    type FormType,
    type PartialReferenceType,
    type PartialCountryDistrict,
} from '../schema';

interface Props {
    error: Error<FormType> | undefined;
    onValueChange: (...entries: EntriesAsList<FormType>) => void;
    value: FormType;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
    districtOptions: DistrictItem[] | null | undefined;
    setDistrictOptions: Dispatch<SetStateAction<DistrictItem[] | null | undefined>>;
}

function ContextTab(props: Props) {
    const strings = useTranslation(i18n);
    const {
        error: formError,
        onValueChange,
        value,
        fileIdToUrlMap,
        disabled,
        setFileIdToUrlMap,
        districtOptions,
        setDistrictOptions,
    } = props;

    const error = getErrorObject(formError);

    const {
        setValue: onCountryDistrictChange,
        removeValue: onCountryDistrictRemove,
    } = useFormArray<'country_district', PartialCountryDistrict>(
        'country_district',
        onValueChange,
    );
    const {
        setValue: onReferenceChange,
        removeValue: onReferenceRemove,
    } = useFormArray<'references', PartialReferenceType>(
        'references',
        onValueChange,
    );

    const handleAddReference = useCallback(() => {
        onValueChange(
            (oldValue: PartialReferenceType[] | undefined) => (
                [
                    ...(oldValue ?? []),
                    {
                        client_id: randomString(),
                    },
                ]
            ),
            'references',
        );
    }, [onValueChange]);

    const handleAddCountryDistrict = useCallback(() => {
        onValueChange(
            (oldValue: PartialCountryDistrict[] | undefined = []) => {
                if (oldValue.length >= 10) {
                    return oldValue;
                }
                return (
                    [
                        ...oldValue,
                        { client_id: randomString() },
                    ]
                );
            },
            'country_district',
        );
    }, [onValueChange]);

    /*
    const countryOptions = useCountry();
    const countryTitleMapById = useMemo(() => (
        listToMap(
            countryOptions,
            (country) => country.id,
            (country) => country.name,
        )
    ), [countryOptions]);
    const disasterOptions = useDisasterType();
    const generateTitle = useCallback((countries: number[], disaster: number) => {
        const countriesTitles = countries
            .map((country) => countryTitleMapById[country])
            .join(' - ');

        const now = new Date();
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = now.getFullYear().toString();

        const date = `${mm}/${yyyy}`;
        const selectedHazard = disasterOptions?.find((item) => item.id === disaster);

        return (`${countriesTitles} - ${selectedHazard?.name}  ${date}`);
    }, [
        countryTitleMapById,
        disasterOptions,
    ]);
    */

    return (
        <Container
            heading={strings.flashUpdateFormContextHeading}
        >
            <InputSection
                title={strings.flashUpdateFormContextCountryTitle}
                description={strings.flashUpdateFormContextCountryDescription}
                multiRow
                oneColumn
            >
                {value.country_district?.map((countryDistrict, index) => (
                    <CountryProvinceInput
                        key={countryDistrict.client_id}
                        index={index}
                        value={countryDistrict}
                        error={getErrorObject(error?.country_district)}
                        onChange={onCountryDistrictChange}
                        onRemove={onCountryDistrictRemove}
                        disabled={disabled}
                        districtOptions={districtOptions}
                        setDistrictOptions={setDistrictOptions}
                    />
                ))}
                {(value?.country_district?.length ?? 0) < 10 && (
                    <div>
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={handleAddCountryDistrict}
                            disabled={disabled}
                        >
                            {strings.flashUpdateFormContextCountryButton}
                        </Button>
                    </div>
                )}
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextHazardTypeTitle}
            >
                <DisasterTypeSelectInput
                    error={error?.hazard_type}
                    name="hazard_type"
                    value={value.hazard_type}
                    onChange={onValueChange}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextTitle}
                description={strings.flashUpdateFormContextTitleDescription}
            >
                <TextInput
                    name="title"
                    // TODO: Auto generate title
                    value={value.title}
                    onChange={onValueChange}
                    error={error?.title}
                    placeholder={strings.flashUpdateFormContextTitlePlaceholder}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextSituationalTitle}
                // Moved into the area as placeholder: description={...}
            >
                <RichTextArea
                    name="situational_overview"
                    value={value.situational_overview}
                    onChange={onValueChange}
                    error={error?.situational_overview}
                    placeholder={strings.flashUpdateFormContextSituationalDescription}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextGraphicTitle}
                description={strings.flashUpdateFormContextGraphicDescription}
            >
                <MultiImageWithCaptionInput
                    // FIXME: Add translations
                    label="Upload"
                    name="graphics_files"
                    url="/api/v2/flash-update-file/multiple/"
                    value={value?.graphics_files}
                    onChange={onValueChange}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    error={getErrorObject(error?.graphics_files)}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextMapTitle}
                description={strings.flashUpdateFormContextMapDescription}
            >
                <MultiImageWithCaptionInput
                    // FIXME: Add translations
                    label="Upload"
                    name="map_files"
                    url="/api/v2/flash-update-file/multiple/"
                    value={value?.map_files}
                    onChange={onValueChange}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    error={getErrorObject(error?.map_files)}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.flashUpdateFormContextReferenceTitle}
                description={strings.flashUpdateFormContextReferenceDescription}
                multiRow
                oneColumn
            >
                {value.references?.map((reference, index) => (
                    <ReferenceInput
                        key={reference.client_id}
                        index={index}
                        value={reference}
                        error={getErrorObject(error?.references)}
                        onChange={onReferenceChange}
                        onRemove={onReferenceRemove}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        disabled={disabled}
                    />
                ))}
                <div>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleAddReference}
                        disabled={disabled}
                    >
                        {strings.flashUpdateFormContextReferenceAddButtonLabel}
                    </Button>
                </div>
            </InputSection>
        </Container>
    );
}

export default ContextTab;
