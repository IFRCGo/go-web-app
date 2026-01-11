import {
    type ObjectSchema,
    undefinedValue,
} from '@togglecorp/toggle-form';

export type ImageWithCaptionValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type ImageWithCaptionSchema = ObjectSchema<ImageWithCaptionValue>;

const imageWithCaptionSchemaFields: ReturnType<ImageWithCaptionSchema['fields']> = {
    client_id: {},
    caption: {},
    id: { defaultValue: undefinedValue },
};

export default imageWithCaptionSchemaFields;
