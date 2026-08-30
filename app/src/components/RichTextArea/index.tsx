import React from 'react';
import {
    InputContainer,
    type InputContainerProps,
} from '@ifrc-go/ui';
import { extractInputContainerProps } from '@ifrc-go/ui/utils';
import {
    Editor,
    type IAllProps,
} from '@tinymce/tinymce-react';
import { _cs } from '@togglecorp/fujs';

import { tinyApiKey } from '#config';

import styles from './styles.module.css';

type RawEditorOptions = NonNullable<IAllProps['init']>;

const editorOptions: Omit<RawEditorOptions, 'selector' | 'target'> = {
    menubar: false, // https://www.tiny.cloud/docs/advanced/available-toolbar-buttons
    statusbar: false,
    paste_data_images: false,
    plugins: 'advlist autolink code help link lists preview',
    toolbar: 'bold italic subscript superscript link | '
    + 'alignleft aligncenter alignright alignjustify | '
    + 'bullist numlist outdent indent | code removeformat preview fullscreen | help',
    contextmenu: 'link',
    // https://www.tiny.cloud/docs/configure/content-filtering/#invalid_styles
    invalid_styles: { '*': 'opacity' },
};

type InheritedProps<T> = Omit<InputContainerProps, 'input'> & {
    value: string | undefined;
    name: T;
    onChange?: (
        value: string | undefined,
        name: T,
    ) => void;
}
interface Props<T extends string | undefined> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement | null>;
    placeholder?: string;
}

function RichTextArea<T extends string | undefined>(props: Props<T>) {
    const {
        disabled,
        className,
        readOnly,
        required,
        ...otherProps
    } = props;

    const [inputContainerProps, inputProps] = extractInputContainerProps(
        otherProps,
    );

    const {
        name,
        value,
        onChange,
        ...editorProps
    } = inputProps;

    const handleChange = React.useCallback((newValue: string | undefined) => {
        if (readOnly || disabled || !onChange) {
            return;
        }
        if (newValue === '') {
            onChange(undefined, name);
        } else {
            onChange(newValue, name);
        }
    }, [
        onChange,
        name,
        readOnly,
        disabled,
    ]);

    // eslint-disable-next-line react/destructuring-assignment
    if (props.placeholder !== undefined) {
        // NOTE(frozenhelium): editorOptions mutated before passing to editor; safe this render
        // eslint-disable-next-line react/destructuring-assignment, react-hooks/immutability
        editorOptions.placeholder = props.placeholder;
    }

    return (
        <InputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputContainerProps}
            className={_cs(styles.richTextArea, className)}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            input={(
                <Editor
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...editorProps}
                    apiKey={tinyApiKey}
                    init={editorOptions}
                    value={value}
                    disabled={readOnly || disabled}
                    onEditorChange={handleChange}
                />
            )}
        />
    );
}

export default RichTextArea;
