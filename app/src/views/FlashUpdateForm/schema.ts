import { type DeepReplace } from '@ifrc-go/ui/utils';
import { getDuplicates } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type ArraySchema,
    emailCondition,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type FlashUpdateBody = GoApiBody<'/api/v2/flash-update/{id}/', 'PATCH'>;
export type FlashUpdatePostBody = GoApiBody<'/api/v2/flash-update/{id}/', 'POST'>;

type CountryDistrictRaw = NonNullable<NonNullable<FlashUpdateBody['country_district']>>[number];
type ReferenceRaw = NonNullable<NonNullable<FlashUpdateBody['references']>>[number];
type MapRaw = NonNullable<NonNullable<FlashUpdateBody['map_files']>>[number];
type GraphicRaw = NonNullable<NonNullable<FlashUpdateBody['graphics_files']>>[number];
type ActionRaw = NonNullable<NonNullable<FlashUpdateBody['actions_taken']>>[number];

type CountryDistrictType = CountryDistrictRaw & { client_id: string };
type ReferenceType = Omit<ReferenceRaw, 'client_id'> & { client_id: string };
type MapType = Omit<MapRaw, 'file'> & { client_id: string, id: number };
type GraphicType = Omit<GraphicRaw, 'file'> & { client_id: string, id: number };
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
    PurgeNull<FlashUpdateFormFields>,
    'client_id'
    >;

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export type PartialCountryDistrict = NonNullable<FormType['country_district']>[number];
type CountryDistrictSchema = ObjectSchema<PartialCountryDistrict, FormType>;
type CountryDistrictSchemaFields = ReturnType<CountryDistrictSchema['fields']>;
type CountryDistrictsSchema = ArraySchema<PartialCountryDistrict, FormType>;
type CountryDistrictsSchemaMember = ReturnType<CountryDistrictsSchema['member']>;

export type PartialReferenceType = NonNullable<FormType['references']>[number];
type ReferenceSchema = ObjectSchema<PartialReferenceType, FormType>;
type ReferenceSchemaFields = ReturnType<ReferenceSchema['fields']>;
type ReferencesSchema = ArraySchema<PartialReferenceType, FormType>;
type ReferencesSchemaMember = ReturnType<ReferencesSchema['member']>;

type MapFormType = NonNullable<FormType['map_files']>[number];
type MapSchema = ObjectSchema<MapFormType, FormType>;
type MapSchemaFields = ReturnType<MapSchema['fields']>;
type MapsSchema = ArraySchema<MapFormType, FormType>;
type MapsSchemaMember = ReturnType<MapsSchema['member']>;

type GraphicFormType = NonNullable<FormType['graphics_files']>[number];
type GraphicSchema = ObjectSchema<GraphicFormType, FormType>;
type GraphicSchemaFields = ReturnType<GraphicSchema['fields']>;
type GraphicsSchema = ArraySchema<GraphicFormType, FormType>;
type GraphicsSchemaMember = ReturnType<GraphicsSchema['member']>;

export type PartialActionTaken = NonNullable<FormType['actions_taken']>[number];
type ActionSchema = ObjectSchema<PartialActionTaken, FormType>;
type ActionSchemaFields = ReturnType<ActionSchema['fields']>;
type ActionsSchema = ArraySchema<PartialActionTaken, FormType>;
type ActionsSchemaMember = ReturnType<ActionsSchema['member']>;

const finalSchema: FormSchema = {
    fields: (): FormSchemaFields => {
        const schema: FormSchemaFields = {
            // CONTEXT
            country_district: {
                keySelector: (country) => country.client_id,
                member: (): CountryDistrictsSchemaMember => ({
                    fields: (): CountryDistrictSchemaFields => ({
                        client_id: {},
                        country: {
                            required: true,
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
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            situational_overview: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
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
                        client_id: {},
                        date: { required: true },
                        source_description: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
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
                        // id: { defaultValue: undefinedValue },
                        client_id: {},
                        organization: { required: true },
                        actions: { defaultValue: [] },
                        summary: {},
                    }),
                }),
            },

            // FOCAL POINTS
            originator_name: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            originator_email: {
                required: true,
                validations: [emailCondition],
            },
            originator_phone: {},
            originator_title: {},
            ifrc_email: { validations: [emailCondition] },
            ifrc_name: {},
            ifrc_phone: {},
            ifrc_title: {},

            // FIXME: do we need this?
            share_with: {},
        };

        return schema;
    },
};

export default finalSchema;
