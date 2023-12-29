import React, {
    useCallback,
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import RawButton from '#components/RawButton';

import styles from './styles.module.css';

export interface ContentBaseProps {
    containerClassName?: string;
    title?: string;
}
export type OptionKey = string | number;

export interface Props<
    RENDER_PROPS extends ContentBaseProps,
    OPTION_KEY extends OptionKey,
    OPTION,
> {
    optionContainerClassName?: string;
    contentRenderer: (props: Pick<RENDER_PROPS, Exclude<keyof RENDER_PROPS, 'containerClassName' | 'title'>>) => React.ReactNode;
    contentRendererParam: (key: OPTION_KEY, opt: OPTION) => RENDER_PROPS;
    option: OPTION;
    optionKey: OPTION_KEY;
    onClick: (optionKey: OPTION_KEY, option: OPTION) => void;
    focusedKey?: { key: OPTION_KEY, mouse?: boolean } | undefined;
}
function GenericOption<
    RENDER_PROPS extends ContentBaseProps,
    OPTION_KEY extends OptionKey,
    OPTION,
>(props: Props<RENDER_PROPS, OPTION_KEY, OPTION>) {
    const {
        optionContainerClassName,
        contentRenderer,
        contentRendererParam,
        option,
        onClick,
        optionKey,
        focusedKey,
    } = props;

    const params = contentRendererParam(optionKey, option);
    const {
        containerClassName,
        title,
        ...contentRendererProps
    } = params;

    const isFocused = focusedKey?.key === optionKey;

    const divRef = useRef<HTMLButtonElement>(null);

    useEffect(
        () => {
            if (focusedKey && focusedKey.key === optionKey && !focusedKey.mouse && divRef.current) {
                divRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        },
        [optionKey, focusedKey],
    );

    const handleClick = useCallback(
        () => {
            onClick(optionKey, option);
        },
        [optionKey, option, onClick],
    );

    return (
        <RawButton
            elementRef={divRef}
            className={_cs(
                styles.genericOption,
                optionContainerClassName,
                containerClassName,
            )}
            onClick={handleClick}
            title={title}
            name={optionKey}
            focused={isFocused}
        >
            {contentRenderer(contentRendererProps)}
        </RawButton>
    );
}
export default GenericOption;
