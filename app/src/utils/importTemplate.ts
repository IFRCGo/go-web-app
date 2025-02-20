import { hasSomeDefinedValue } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isObject,
    listToMap,
    mapToMap,
    randomString,
} from '@togglecorp/fujs';
import { type CellRichTextValue } from 'exceljs';

import {
    type ParsePlugin,
    parsePseudoHtml,
} from '#utils/richText';

type ValidationType = string | number | boolean | 'textArea';
type TypeToLiteral<T extends ValidationType> = T extends string
    ? 'string' | 'date' | 'textArea'
    : T extends number
    ? 'integer' | 'number'
    : T extends boolean
    ? 'boolean'
    : never;

type ExtractValidation<T> = T extends ValidationType
    ? T
    : never;

interface BaseField {
    label: string;
    description?: string;
    headingBefore?: string;
}

interface InputField<
    VALIDATION extends ValidationType
> extends BaseField {
    type: 'input'
    validation: TypeToLiteral<VALIDATION>
}

interface SelectField<
    VALIDATION extends ValidationType,
    OPTIONS_MAPPING extends TemplateFieldOptionsMapping,
> extends BaseField {
    type: 'select'
    validation: TypeToLiteral<VALIDATION>
    // Make this more strict
    optionsKey: {
        [key in keyof OPTIONS_MAPPING]: VALIDATION extends OPTIONS_MAPPING[key][number]['key']
        ? key
        : never
    }[keyof OPTIONS_MAPPING]
}

interface ListField<
    VALUE,
    OPTIONS_MAPPING extends TemplateFieldOptionsMapping
> extends BaseField {
    type: 'list'
    // TODO: Make this more strict
    optionsKey: keyof OPTIONS_MAPPING;
    keyFieldName?: string;
    hiddenLabel?: boolean;
    children: TemplateSchema<
        VALUE,
        OPTIONS_MAPPING
    >;
}

interface ObjectField<VALUE, OPTIONS_MAPPING extends TemplateFieldOptionsMapping> {
    type: 'object',
    fields: {
        [key in keyof VALUE]+?: TemplateSchema<
            VALUE[key],
            OPTIONS_MAPPING
        >
    },
}

export interface TemplateOptionItem<T extends ValidationType> {
    key: T;
    label: string;
    description?: string;
}

export interface TemplateFieldOptionsMapping {
    [key: string]: TemplateOptionItem<string>[]
    | TemplateOptionItem<number>[]
    | TemplateOptionItem<boolean>[]
}

export type TemplateSchema<
    VALUE,
    OPTIONS_MAPPING extends TemplateFieldOptionsMapping,
> = VALUE extends (infer LIST_ITEM)[]
    ? (
        ListField<LIST_ITEM, OPTIONS_MAPPING>
        | InputField<ExtractValidation<LIST_ITEM>>
        | SelectField<ExtractValidation<LIST_ITEM>, OPTIONS_MAPPING>
    ) : (
        VALUE extends object
        ? ObjectField<VALUE, OPTIONS_MAPPING>
        : (InputField<ExtractValidation<VALUE>>
            | SelectField<ExtractValidation<VALUE>, OPTIONS_MAPPING>)
    );

// NOTE: Not adding richtext support on heading
interface HeadingTemplateField {
    type: 'heading';
    name: string | number | boolean;
    label: string;
    outlineLevel: number;
    description?: string;
    context: { field: string, key: string }[],
}

type ObjectKey = string | number | symbol;

type InputTemplateField = {
    type: 'input';
    name: string | number | boolean;
    label: string | CellRichTextValue;
    outlineLevel: number;
    description?: string | CellRichTextValue;
    headingBefore?: string;
    context: { field: string, key: string }[],
} & ({
    dataValidation: 'list';
    optionsKey: ObjectKey;
} | {
    dataValidation?: 'number' | 'integer' | 'date' | 'textArea';
    optionsKey?: never;
})

export function getCombinedKey(
    key: string | number | boolean | symbol,
    parentKey: string | number | boolean | symbol | undefined,
) {
    if (isNotDefined(parentKey)) {
        return String(key);
    }

    return `${String(parentKey)}__${String(key)}`;
}

export type TemplateField = HeadingTemplateField | InputTemplateField;

function createInsPlugin(
    optionsMap: TemplateFieldOptionsMapping,
    context: { field: string, key: string }[],
): ParsePlugin {
    return {
        tag: 'ins',
        transformer: (token, richText) => {
            const [optionField, valueField] = token.split('.');
            const currOptions = context?.find((item) => item.field === optionField);
            const selectedOption = currOptions
                ? optionsMap?.[optionField]?.find(
                    (option) => String(option.key) === currOptions?.key,
                )
                : undefined;

            return {
                ...richText,
                // FIXME: Need to add mechanism to identify if we have error for mapping
                text: selectedOption?.[valueField as 'description'] ?? '',
            };
        },
    };
}

export function createImportTemplate<
    TEMPLATE_SCHEMA,
    OPTIONS_MAPPING extends TemplateFieldOptionsMapping
>(
    schema: TemplateSchema<TEMPLATE_SCHEMA, OPTIONS_MAPPING>,
    optionsMap: OPTIONS_MAPPING,
    fieldName: string | undefined = undefined,
    outlineLevel = -1,
    context: { field: string, key: string }[] = [],
): TemplateField[] {
    if (schema.type === 'object') {
        return [
            ...Object.keys(schema.fields).flatMap((key) => {
                const fieldSchema = schema.fields[key as keyof typeof schema.fields];

                if (fieldSchema) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newFields = createImportTemplate<any, OPTIONS_MAPPING>(
                        fieldSchema,
                        optionsMap,
                        getCombinedKey(key, fieldName),
                        outlineLevel + 1,
                        context,
                    );

                    return newFields;
                }

                return [];
            }),
        ];
    }

    if (isNotDefined(fieldName)) {
        return [];
    }

    const fields: TemplateField[] = [];

    if (isDefined(schema.headingBefore)) {
        fields.push({
            type: 'heading',
            name: getCombinedKey('heading_before', fieldName),
            label: schema.headingBefore,
            outlineLevel,
            context,
        } satisfies HeadingTemplateField);
    }

    const insPlugin = createInsPlugin(optionsMap, context);

    if (schema.type === 'input') {
        const field = {
            type: 'input',
            name: fieldName,
            label: parsePseudoHtml(schema.label, [insPlugin]),
            description: parsePseudoHtml(schema.description, [insPlugin]),
            dataValidation: (schema.validation === 'number' || schema.validation === 'date' || schema.validation === 'integer' || schema.validation === 'textArea')
                ? schema.validation
                : undefined,
            outlineLevel,
            context,
        } satisfies InputTemplateField;

        fields.push(field);
        return fields;
    }

    if (schema.type === 'select') {
        const field = {
            type: 'input',
            name: fieldName,
            label: parsePseudoHtml(schema.label, [insPlugin]),
            description: parsePseudoHtml(schema.description, [insPlugin]),
            outlineLevel,
            dataValidation: 'list',
            optionsKey: schema.optionsKey,
            context,
        } satisfies InputTemplateField;

        fields.push(field);
        return fields;
    }

    const headingField = {
        type: 'heading',
        name: fieldName,
        label: schema.label,
        description: schema.description,
        outlineLevel,
        context,
    } satisfies HeadingTemplateField;

    const options = optionsMap[schema.optionsKey];

    const optionFields = options.flatMap((option) => {
        const subHeadingField = {
            type: 'heading',
            name: getCombinedKey(option.key, fieldName),
            label: option.label,
            outlineLevel: outlineLevel + 1,
            context,
        } satisfies HeadingTemplateField;

        const combinedKey = getCombinedKey(option.key, fieldName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newFields = createImportTemplate<any, OPTIONS_MAPPING>(
            schema.children,
            optionsMap,
            // undefined,
            combinedKey,
            outlineLevel + 1,
            [...context, { field: String(schema.optionsKey), key: String(option.key) }],
        );

        return [
            subHeadingField,
            ...newFields,
        ];
    });

    return [
        ...fields,
        !schema.hiddenLabel ? headingField : undefined,
        ...optionFields,
    ].filter(isDefined);
}

function addClientId(item: object): object {
    return { ...item, client_id: randomString() };
}

export function getValueFromImportTemplate<
    TEMPLATE_SCHEMA,
    OPTIONS_MAPPING extends TemplateFieldOptionsMapping,
>(
    schema: TemplateSchema<TEMPLATE_SCHEMA, OPTIONS_MAPPING>,
    optionsMap: OPTIONS_MAPPING,
    formValues: Record<string, string | number | boolean>,
    fieldName: string | undefined = undefined,
    transformListObject: ((item: object) => object) = addClientId,
): unknown {
    const optionsReverseMap = mapToMap(
        optionsMap,
        (key) => key,
        (optionList: TemplateOptionItem<ValidationType>[]) => (
            listToMap(
                optionList,
                ({ label }) => label,
                ({ key }) => key,
            )
        ),
    );

    if (schema.type === 'object') {
        return mapToMap(
            schema.fields,
            (key) => key,

            (fieldSchema, key) => getValueFromImportTemplate(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fieldSchema as TemplateSchema<any, OPTIONS_MAPPING>,
                optionsMap,
                formValues,
                getCombinedKey(key, fieldName),
            ),
        );
    }

    if (isNotDefined(fieldName)) {
        return undefined;
    }

    if (schema.type === 'input') {
        const value = formValues[fieldName];
        if (
            (fieldName === 'source_information__source__0__source_link'
                || fieldName === 'source_information__source__1__source_link'
                || fieldName === 'source_information__source__2__source_link'
                || fieldName === 'source_information__source__3__source_link'
                || fieldName === 'source_information__source__4__source_link'
            )
            && isDefined(value) && (typeof value === 'string') && !value.includes('://')
        ) {
            // TODO: we need to find a better solution to this
            return `https://${value}`;
        }
        // TODO: add validation from schema.validation
        return value;
    }

    if (schema.type === 'select') {
        const value = formValues[fieldName];
        const valueKey = optionsReverseMap[
            schema.optionsKey as string
        ]?.[String(value)];
        // TODO: add validation from schema.validation
        return valueKey;
    }

    const options = optionsMap[schema.optionsKey];

    const listValue = options.map((option) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = getValueFromImportTemplate<any, OPTIONS_MAPPING>(
            schema.children,
            optionsMap,
            formValues,
            getCombinedKey(option.key, fieldName),
        );

        if (isObject(value) && hasSomeDefinedValue(value)) {
            if (schema.keyFieldName) {
                return {
                    [schema.keyFieldName]: option.key,
                    ...transformListObject(value),
                };
            }
            return transformListObject(value);
        }
        return undefined;
    }).filter(isDefined);

    if (listValue.length === 0) {
        return undefined;
    }

    return listValue;
}

/*
type TemplateName = 'dref-application' | 'dref-operational-update' | 'dref-final-report';

export interface ImportTemplateDescription<FormFields> {
    application: 'ifrc-go',
    templateName: TemplateName,
    meta: Record<string, unknown>;
    schema: TemplateSchema<FormFields, TemplateFieldOptionsMapping>,
    optionsMap: TemplateFieldOptionsMapping,
    fieldNameToTabNameMap: Record<string, string>,
}

function isValidTemplate(templateName: unknown): templateName is TemplateName {
    const templateNameMap: Record<TemplateName, boolean> = {
        'dref-application': true,
        'dref-operational-update': true,
        'dref-final-report': true,
    };

    return !!templateNameMap[templateName as TemplateName];
}

function isValidOption<T extends string | number | boolean>(
    option: unknown,
): option is TemplateOptionItem<T> {
    if (!isObject(option)) {
        return false;
    }

    if (!('key' in option) || !('label' in option)) {
        return false;
    }

    if (typeof option.label !== 'string') {
        return false;
    }

    if (
        typeof option.key !== 'string'
            && typeof option.key !== 'number'
            && typeof option.key !== 'boolean'
    ) {
        return false;
    }

    return true;
}

function isValidOptionList(
    optionList: unknown,
): optionList is (TemplateOptionItem<number>[]
    | TemplateOptionItem<string>[]
    | TemplateOptionItem<boolean>[]
) {
    if (!Array.isArray(optionList)) {
        return false;
    }

    const firstElement = optionList[0];
    if (!isValidOption(firstElement)) {
        return false;
    }

    const keyType = typeof firstElement.key;

    return optionList.every((option) => (
        isValidOption(option) && typeof option.key === keyType
    ));
}
*/

/*
export function isValidTemplateDescription<FormFields>(
    value: unknown,
): value is ImportTemplateDescription<FormFields> {
    if (!isObject(value)) {
        return false;
    }

    type DescriptionKey = keyof ImportTemplateDescription<unknown>;

    if (!('application' satisfies DescriptionKey in value) || value.application !== 'ifrc-go') {
        return false;
    }

    if (
        !('templateName' satisfies DescriptionKey in value)
            || !isValidTemplate(value.templateName)
    ) {
        return false;
    }

    if (!('meta' satisfies DescriptionKey in value) || !isObject(value.meta)) {
        return false;
    }

    if (!('schema' satisfies DescriptionKey in value) || !isObject(value.schema)) {
        return false;
    }

    if (
        !('optionsMap' satisfies DescriptionKey in value)
        || !isObject(value.optionsMap)
        || !(Object.values(value.optionsMap).every((optionList) => isValidOptionList(optionList)))
    ) {
        return false;
    }

    if (
        !('fieldNameToTabNameMap' satisfies DescriptionKey in value)
        || !(isObject(value.fieldNameToTabNameMap))
        || !(Object.values(value.fieldNameToTabNameMap).every(
            (field) => typeof field === 'string',
        ))
    ) {
        return false;
    }

    return true;
}
*/
