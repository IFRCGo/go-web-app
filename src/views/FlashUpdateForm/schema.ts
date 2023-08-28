import { isDefined } from '@togglecorp/fujs';
import {
    type PartialForm,
    type ArraySchema,
    type PurgeNull,
    ObjectSchema,
    undefinedValue,
    emailCondition,
} from '@togglecorp/toggle-form';

import { type DeepReplace, type DeepRemoveKeyPattern } from '#utils/common';
import { type GoApiBody } from '#utils/restRequest';
import { getDuplicates } from '#utils/common';

export type FlashUpdateBody = GoApiBody<'/api/v2/flash-update/{id}/', 'PUT'>;

type CountryDistrictRaw = NonNullable<NonNullable<FlashUpdateBody['country_district']>>[number];
type ReferenceRaw = NonNullable<NonNullable<FlashUpdateBody['references']>>[number];
type MapRaw = NonNullable<NonNullable<FlashUpdateBody['map_files']>>[number];
type GraphicRaw = NonNullable<NonNullable<FlashUpdateBody['graphics_files']>>[number];
type ActionRaw = NonNullable<NonNullable<FlashUpdateBody['actions_taken']>>[number];

type CountryDistrictType = CountryDistrictRaw & { client_id: string };
type ReferenceType = Omit<ReferenceRaw, 'client_id'> & { client_id: string };
type MapType = MapRaw & { client_id: string };
type GraphicType = GraphicRaw & { client_id: string };
type ActionType = ActionRaw & { client_id: string };

type FlashUpdateFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        FlashUpdateBody,
                        CountryDistrictRaw,
                        CountryDistrictType
                    >,
                    ReferenceRaw,
                    ReferenceType
                >,
                MapRaw,
                MapType
            >,
            GraphicRaw,
            GraphicType
        >,
        ActionRaw,
        ActionType
    >
);

export type FormType = PartialForm<
    PurgeNull<DeepRemoveKeyPattern<FlashUpdateFormFields, '_details' | '_display'>>,
    'client_id'
    >;

export type FormSchema = ObjectSchema<FormType>;
export type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type PartialCountryDistrict = NonNullable<FormType['country_district']>[number];
export type CountryDistrictSchema = ObjectSchema<PartialCountryDistrict, FormType>;
export type CountryDistrictSchemaFields = ReturnType<CountryDistrictSchema['fields']>;
export type CountryDistrictsSchema = ArraySchema<PartialCountryDistrict, FormType>;
export type CountryDistrictsSchemaMember = ReturnType<CountryDistrictsSchema['member']>;

export type PartialReferenceType = NonNullable<FormType['references']>[number];
export type ReferenceSchema = ObjectSchema<PartialReferenceType, FormType>;
export type ReferenceSchemaFields = ReturnType<ReferenceSchema['fields']>;
export type ReferencesSchema = ArraySchema<PartialReferenceType, FormType>;
export type ReferencesSchemaMember = ReturnType<ReferencesSchema['member']>;

type MapFormType = NonNullable<FormType['map_files']>[number];
export type MapSchema = ObjectSchema<MapFormType, FormType>;
export type MapSchemaFields = ReturnType<MapSchema['fields']>;
export type MapsSchema = ArraySchema<MapFormType, FormType>;
export type MapsSchemaMember = ReturnType<MapsSchema['member']>;

type GraphicFormType = NonNullable<FormType['graphics_files']>[number];
export type GraphicSchema = ObjectSchema<GraphicFormType, FormType>;
export type GraphicSchemaFields = ReturnType<GraphicSchema['fields']>;
export type GraphicsSchema = ArraySchema<GraphicFormType, FormType>;
export type GraphicsSchemaMember = ReturnType<GraphicsSchema['member']>;

export type PartialActionTaken = NonNullable<FormType['actions_taken']>[number];
export type ActionSchema = ObjectSchema<PartialActionTaken, FormType>;
export type ActionSchemaFields = ReturnType<ActionSchema['fields']>;
export type ActionsSchema = ArraySchema<PartialActionTaken, FormType>;
export type ActionsSchemaMember = ReturnType<ActionsSchema['member']>;

const finalSchema: FormSchema = {
    fields: (): FormSchemaFields => {
        const schema: FormSchemaFields = {
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
                validation: (val) => {
                    if ((val?.length ?? 0) <= 0) {
                        return 'At least 1 country should be selected';
                    }
                    if ((val?.length ?? 0) > 10) {
                        return 'More than 10 countries are not allowed';
                    }
                    const dups = getDuplicates(
                        (val ?? []).map((item) => item.country).filter(isDefined),
                        (item) => item,
                        (count) => count > 1,
                    );
                    if (dups.length >= 1) {
                        return 'Duplicate countries are not allowed';
                    }

                    return undefined;
                },
            },
            hazard_type: { required: true },
            title: { required: true },
            situational_overview: { required: true },
            graphics_files: {
                keySelector: (graphic) => graphic.client_id,
                member: (): GraphicsSchemaMember => ({
                    fields: (): GraphicSchemaFields => ({
                        id: { defaultValue: undefinedValue },
                        client_id: {},
                        caption: {},
                    }),
                }),
                validation: (val) => {
                    if ((val?.length ?? 0) > 3) {
                        return 'More than 3 graphics are not allowed';
                    }
                    return undefined;
                },
            },
            map_files: {
                keySelector: (mapFile) => mapFile.client_id,
                member: (): MapsSchemaMember => ({
                    fields: (): MapSchemaFields => ({
                        id: { defaultValue: undefinedValue },
                        client_id: {},
                        caption: {},
                    }),
                }),
                validation: (val) => {
                    if ((val?.length ?? 0) > 3) {
                        return 'More than 3 maps are not allowed';
                    }
                    return undefined;
                },
            },
            references: {
                keySelector: (reference) => reference.client_id,
                member: (): ReferencesSchemaMember => ({
                    fields: (): ReferenceSchemaFields => ({
                        id: { defaultValue: undefinedValue },
                        client_id: {},
                        date: { required: true },
                        source_description: { required: true },
                        url: {},
                        document: {},
                    }),
                }),
            },

            // ACTIONS
            actions_taken: {
                keySelector: (actionTaken) => actionTaken.client_id,
                member: (): ActionsSchemaMember => ({
                    fields: (): ActionSchemaFields => ({
                        id: { defaultValue: undefinedValue },
                        client_id: {},
                        organization: {},
                        actions: {},
                        summary: {},
                    }),
                }),
            },

            // FOCAL POINTS
            originator_name: { required: true },
            originator_email: { required: true, validations: [emailCondition] },
            originator_phone: {},
            originator_title: {},
            ifrc_email: {},
            ifrc_name: {},
            ifrc_phone: {},
            ifrc_title: {},

            // ?
            share_with: {},
        };

        return schema;
    },
};

export default finalSchema;
