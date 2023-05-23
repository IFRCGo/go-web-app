import React from 'react';
import { Editor, IAllProps } from '@tinymce/tinymce-react';
import { _cs } from '@togglecorp/fujs';
import { tinyApiKey } from '#config';

import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';

import styles from './styles.module.css';

type RawEditorOptions = IAllProps['init'];

const editorOptions: Omit<RawEditorOptions, 'selector' | 'target'> = {
    menubar: false, // https://www.tiny.cloud/docs/advanced/available-toolbar-buttons
    statusbar: false,
    plugins: ['advlist autolink code help link lists preview'],
    toolbar: 'formatselect | bold italic superscript link | '
    + 'alignleft aligncenter alignright alignjustify | '
    + 'bullist numlist outdent indent | code removeformat preview | help',
    contextmenu: 'formats link',
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
export interface Props<T extends string | undefined> extends InheritedProps<T> {
    inputElementRef?: React.RefObject<HTMLInputElement>;
    inputClassName?: string;
    placeholder?: string;
}

function RichTextArea<T extends string | undefined>(props: Props<T>) {
    const {
        className,
        actions,
        icons,
        error,
        label,
        disabled,
        readOnly,
        name,
        value,
        onChange,
        ...otherInputProps
    } = props;

    const handleChange = React.useCallback((newValue: string | undefined) => {
        // FIXME: do we even need to pass name?
        if (readOnly || disabled) {
            return;
        }
        if (onChange) {
            if (newValue === '') {
                onChange(undefined, name);
            } else {
                onChange(newValue, name);
            }
        }
    }, [
        onChange,
        name,
        readOnly,
        disabled,
    ]);

    // eslint-disable-next-line react/destructuring-assignment
    if (props.placeholder !== undefined) {
        // eslint-disable-next-line react/destructuring-assignment
        editorOptions.placeholder = props.placeholder;
    }

    return (
        <InputContainer
            className={_cs(styles.richTextArea, className)}
            actions={actions}
            icons={icons}
            error={error}
            label={label}
            disabled={disabled}
            input={(
                <Editor
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherInputProps}
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
