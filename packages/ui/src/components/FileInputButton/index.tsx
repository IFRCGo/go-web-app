import ButtonLayout, { type Props as ButtonLayoutProps } from '#components/ButtonLayout';
import RawFileInput, {
    type CommonRawFileInputProps,
    type MultipleRawFileInputProps,
    type SingleRawFileInputProps,
} from '#components/RawFileInput';

export type Props<NAME> = Omit<ButtonLayoutProps, 'onChange'>
    & Omit<CommonRawFileInputProps<NAME>, 'children' | 'className'>
    & (SingleRawFileInputProps<NAME> | MultipleRawFileInputProps<NAME>);

/**
 * Button-like file input (specific layer).
 *
 * Composes RawFileInput (hidden-input plumbing) with ButtonLayout
 * (visuals); this is the styled half of the former RawFileInput, which
 * now only keeps the plumbing.
 *
 * Deliberately retains ButtonLayout's two-axis colorVariant +
 * styleVariant API instead of the curated Button `variant`: the
 * historical default pair (colorVariant 'secondary', styleVariant
 * 'translucent') has no curated equivalent, so a curated prop could
 * not preserve existing visuals.
 *
 * `className` and `children` go to the ButtonLayout; `elementRef`
 * references the ButtonLayout root, the visual root of the component
 * (the label element wrapping it has `display: contents` and
 * generates no box).
 */
function FileInputButton<NAME>(props: Props<NAME>) {
    const {
        accept,
        disabled,
        inputProps,
        inputRef,
        multiple,
        name,
        onChange,
        readOnly,
        spacingOffset = -3,
        ...buttonLayoutProps
    } = props;

    const buttonLayout = (
        <ButtonLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonLayoutProps}
            spacingOffset={spacingOffset}
            disabled={disabled}
            readOnly={readOnly}
        />
    );

    const commonInputProps = {
        accept,
        disabled,
        inputProps,
        inputRef,
        name,
        readOnly,
    };

    if (multiple) {
        return (
            <RawFileInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...commonInputProps}
                multiple
                onChange={onChange}
            >
                {buttonLayout}
            </RawFileInput>
        );
    }

    return (
        <RawFileInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...commonInputProps}
            onChange={onChange}
        >
            {buttonLayout}
        </RawFileInput>
    );
}

export default FileInputButton;
