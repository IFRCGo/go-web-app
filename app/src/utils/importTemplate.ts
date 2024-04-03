import { isNotDefined } from '@togglecorp/fujs';

type ValidationType = string | number | boolean;
type TypeToLiteral<T extends ValidationType> = T extends string
    ? 'string' | 'date'
    : T extends number
        ? 'number'
        : T extends boolean
            ? 'boolean'
            : never;
type ExtractValidation<T> = T extends ValidationType
    ? T
    : never;

interface BaseField {
    label: string;
}

interface InputField<
    VALIDATION extends ValidationType
> extends BaseField {
    type: 'input'
    validation: TypeToLiteral<VALIDATION>
}

interface SelectField<
    VALIDATION extends ValidationType,
    OPTIONS_MAPPING extends OptionsMapping,
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
    OPTIONS_MAPPING extends OptionsMapping
> extends BaseField {
    type: 'list'
    // TODO: Make this more strict
    optionsKey: keyof OPTIONS_MAPPING;
    children: TemplateSchema<
        VALUE,
        OPTIONS_MAPPING
    >;
}

interface ObjectField<VALUE, OPTIONS_MAPPING extends OptionsMapping> {
    type: 'object',
    fields: {
        [key in keyof VALUE]+?: TemplateSchema<
            VALUE[key],
            OPTIONS_MAPPING
        >
    },
}

interface OptionItem<T extends ValidationType> {
    key: T;
    label: string;
}

interface OptionsMapping {
    [key: string]: OptionItem<string>[] | OptionItem<number>[] | OptionItem<boolean>[]
}

export type TemplateSchema<
    VALUE,
    OPTIONS_MAPPING extends OptionsMapping,
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

interface HeadingTemplateField {
    type: 'heading';
    name: string | number | boolean;
    label: string;
    outlineLevel: number;
}

type ObjectKey = string | number | symbol;

type InputTemplateField = {
    type: 'input';
    name: string | number | boolean;
    label: string;
    outlineLevel: number;
} & ({
    dataValidation: 'list';
    optionsKey: ObjectKey;
} | {
    dataValidation?: never;
    optionsKey?: never;
})

type TemplateField = HeadingTemplateField | InputTemplateField;

export function createImportTemplate<TEMPLATE_SCHEMA, OPTIONS_MAPPING extends OptionsMapping>(
    schema: TemplateSchema<TEMPLATE_SCHEMA, OPTIONS_MAPPING>,
    optionsMap: OPTIONS_MAPPING,
    fieldName: string | undefined = undefined,
    outlineLevel = -1,
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
                        key,
                        outlineLevel + 1,
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

    if (schema.type === 'input') {
        const field = {
            type: 'input',
            name: fieldName,
            label: schema.label,
            outlineLevel,
        } satisfies InputTemplateField;

        return [field];
    }

    if (schema.type === 'select') {
        const field = {
            type: 'input',
            name: fieldName,
            label: schema.label,
            outlineLevel,
            dataValidation: 'list',
            optionsKey: schema.optionsKey,
        } satisfies InputTemplateField;

        return [field];
    }

    const headingField = {
        type: 'heading',
        name: fieldName,
        label: schema.label,
        outlineLevel,
    } satisfies HeadingTemplateField;

    // fields.push(headingField);
    const options = optionsMap[schema.optionsKey];

    const optionFields = options.flatMap((option) => {
        const subHeadingField = {
            type: 'heading',
            name: option.key,
            label: option.label,
            outlineLevel: outlineLevel + 1,
        } satisfies HeadingTemplateField;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newFields = createImportTemplate<any, OPTIONS_MAPPING>(
            schema.children,
            optionsMap,
            undefined,
            outlineLevel + 1,
        );

        return [
            subHeadingField,
            ...newFields,
        ];
    });

    return [
        headingField,
        ...optionFields,
    ];
}
