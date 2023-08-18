import {
    PartialForm,
    ArraySchema,
    ObjectSchema,
    emailCondition,
    addCondition,
    blacklistCondition,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import { type GoApiBody } from '#utils/restRequest';

export type FlashUpdateBody = GoApiBody<'/api/v2/flash-update/{id}/', 'PUT'>;
type CountryDistrictRaw = NonNullable<NonNullable<FlashUpdateBody['country_district']>>[number];
type ReferenceRaw = NonNullable<NonNullable<FlashUpdateBody['references']>>[number];
type MapRaw = NonNullable<NonNullable<FlashUpdateBody['map_files']>>[number];
type GraphicRaw = NonNullable<NonNullable<FlashUpdateBody['graphics_files']>>[number];
type ActionRaw = NonNullable<NonNullable<FlashUpdateBody['actions_taken']>>[number];

type CountryDistrictType = CountryDistrictRaw & { client_id: string };
type ReferenceType = ReferenceRaw & { client_id: string };
type MapType = MapRaw & { client_id: string };
type GraphicType = GraphicRaw & { client_id: string };
type ActionType = ActionRaw & { client_id: string };

type FlashUpdateFormFields = Omit<
    FlashUpdateBody,
    'country_district' | 'references' | 'map_files' | 'graphics_files' | 'actions_taken'
> & {
    'country_district': CountryDistrictType[];
    'references': ReferenceType[];
    'map_files': MapType[];
    'graphics_files': GraphicType[];
    'actions_taken': ActionType[];
};

export type PartialCountryDistrict = PartialForm<CountryDistrictType, 'client_id'>;
export type PartialActionTaken = PartialForm<ActionType, 'client_id'>;
export type PartialReferenceType = PartialForm<ReferenceType, 'client_id'>;

export type FormType = PartialForm<FlashUpdateFormFields, 'client_id'>;

export type FormSchema = ObjectSchema<FormType>;
export type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type CountryDistrictSchema = ObjectSchema<PartialForm<CountryDistrictType, 'client_id'>, FormType>;
export type CountryDistrictSchemaFields = ReturnType<CountryDistrictSchema['fields']>;
export type CountryDistrictsSchema = ArraySchema<PartialForm<CountryDistrictType, 'client_id'>, FormType>;
export type CountryDistrictsSchemaMember = ReturnType<CountryDistrictsSchema['member']>;

export type ReferenceSchema = ObjectSchema<PartialForm<ReferenceType, 'client_id'>, FormType>;
export type ReferenceSchemaFields = ReturnType<ReferenceSchema['fields']>;
export type ReferencesSchema = ArraySchema<PartialForm<ReferenceType, 'client_id'>, FormType>;
export type ReferencesSchemaMember = ReturnType<ReferencesSchema['member']>;

export type MapSchema = ObjectSchema<PartialForm<MapType, 'client_id'>, FormType>;
export type MapSchemaFields = ReturnType<MapSchema['fields']>;
export type MapsSchema = ArraySchema<PartialForm<MapType, 'client_id'>, FormType>;
export type MapsSchemaMember = ReturnType<MapsSchema['member']>;

export type GraphicSchema = ObjectSchema<PartialForm<GraphicType, 'client_id'>, FormType>;
export type GraphicSchemaFields = ReturnType<GraphicSchema['fields']>;
export type GraphicsSchema = ArraySchema<PartialForm<GraphicType, 'client_id'>, FormType>;
export type GraphicsSchemaMember = ReturnType<GraphicsSchema['member']>;

export type ActionSchema = ObjectSchema<PartialForm<ActionType, 'client_id'>, FormType>;
export type ActionSchemaFields = ReturnType<ActionSchema['fields']>;
export type ActionsSchema = ArraySchema<PartialForm<ActionType, 'client_id'>, FormType>;
export type ActionsSchemaMember = ReturnType<ActionsSchema['member']>;

const finalSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let schema: FormSchemaFields = {
            hazard_type: { required: true },
            title: { required: true },
            situational_overview: { required: true },
            originator_name: { required: true },
            originator_email: { required: true, validations: [emailCondition] },
            originator_phone: {},
            originator_title: {},
            ifrc_email: {},
            ifrc_name: {},
            ifrc_phone: {},
            ifrc_title: {},
            share_with: {},
            graphics_files: {
                keySelector: (graphic) => graphic.client_id,
                member: (): GraphicsSchemaMember => ({
                    fields: (): GraphicSchemaFields => ({
                        id: {},
                        client_id: {},
                        caption: {},
                    }),
                }),
            },
            map_files: {
                keySelector: (mapFile) => mapFile.client_id,
                member: (): MapsSchemaMember => ({
                    fields: (): MapSchemaFields => ({
                        id: {},
                        client_id: {},
                        caption: {},
                    }),
                }),
            },
            references: {
                keySelector: (reference) => reference.client_id,
                member: (): ReferencesSchemaMember => ({
                    fields: (): ReferenceSchemaFields => ({
                        client_id: {},
                        date: { required: true },
                        source_description: { required: true },
                        url: {},
                        document: {},
                    }),
                }),
            },
            actions_taken: {
                keySelector: (actionTaken) => actionTaken.client_id,
                member: (): ActionsSchemaMember => ({
                    fields: (): ActionSchemaFields => ({
                        client_id: {},
                        organization: {},
                        actions: {},
                        summary: {},
                    }),
                }),
            },
        };

        schema = addCondition(
            schema,
            value,
            ['country_district'] as const,
            ['country_district'] as const,
            (val): Pick<FormSchemaFields, 'country_district'> => {
                const countryIds = val?.country_district
                    ?.map((country) => country.country).filter(isDefined);

                console.warn('here', countryIds);
                return {
                    country_district: {
                        keySelector: (country) => country.client_id,
                        member: (): CountryDistrictsSchemaMember => ({
                            fields: (): CountryDistrictSchemaFields => ({
                                client_id: {},
                                country: {
                                    required: true,
                                    // NOTE: Validation yet to be written
                                    // validations: [blacklistCondition(countryIds ?? [])],
                                },
                                district: { defaultValue: [] },
                            }),
                        }),
                        // validation: [lengthSmallerThanCondition(11)],
                    },
                };
            },
        );

        return schema;
    },
    validation: (value) => {
        const errors = [];
        if ((value?.country_district?.length ?? 0) > 10) {
            errors.push('More that 10 countries are not allowed');
        }

        if ((value?.graphics_files?.length ?? 0) > 3) {
            errors.push('More that 3 graphics are not allowed');
        }

        if ((value?.map_files?.length ?? 0) > 3) {
            errors.push('More that 3 maps are not allowed');
        }

        if (errors.length > 0) {
            return errors.join(', ');
        }

        return undefined;
    },
};

export default finalSchema;
