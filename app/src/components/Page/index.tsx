import {
    type RefObject,
    useEffect,
} from 'react';
import {
    type HeadingProps,
    ListView,
    PageContainer,
    PageHeader,
} from '@ifrc-go/ui';
import { type Language } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    languageNameMapEn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type components } from '#generated/types';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TranslationModuleOriginalLanguageEnum = components<'read'>['schemas']['TranslationModuleOriginalLanguageEnum'];

interface Props {
    className?: string;
    title?: string;
    actions?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    mainSectionContainerClassName?: string;
    breadCrumbs?: React.ReactNode;
    info?: React.ReactNode;
    children?: React.ReactNode;
    mainSectionClassName?: string;
    wikiLink?: React.ReactNode;
    withBackgroundColorInMainSection?: boolean;
    elementRef?: RefObject<HTMLDivElement | null>;
    blockingContent?: React.ReactNode;
    contentOriginalLanguage?: TranslationModuleOriginalLanguageEnum;
    beforeHeaderContent?: React.ReactNode;
    headerBackground?: React.ReactNode;
    headingColorVariant?: HeadingProps['colorVariant'];
}

function Page(props: Props) {
    const {
        className,
        title,
        actions,
        heading,
        description,
        breadCrumbs,
        info,
        children,
        mainSectionContainerClassName,
        mainSectionClassName,
        wikiLink,
        withBackgroundColorInMainSection,
        elementRef,
        blockingContent,
        contentOriginalLanguage,
        beforeHeaderContent,
        headerBackground,
        headingColorVariant,
    } = props;

    const currentLanguage = useCurrentLanguage();
    const strings = useTranslation(i18n);

    useEffect(() => {
        if (isDefined(title)) {
            document.title = title;
        }
    }, [title]);

    const showMachineTranslationWarning = isDefined(contentOriginalLanguage)
        && contentOriginalLanguage !== currentLanguage;

    const showPageContainer = !!breadCrumbs
        || !!heading
        || !!description
        || !!info
        || !!actions
        || !!wikiLink;

    return (
        <div
            className={_cs(
                styles.page,
                className,
            )}
            ref={elementRef}
        >
            {isNotDefined(blockingContent)
                && showMachineTranslationWarning
                && (
                    <div className={styles.machineTranslationWarning}>
                        {resolveToString(
                            strings.machineTranslatedContentWarning,
                            // eslint-disable-next-line max-len
                            { contentOriginalLanguage: languageNameMapEn[contentOriginalLanguage as Language] },
                        )}
                    </div>
                )}
            {beforeHeaderContent && (
                <PageContainer>
                    {beforeHeaderContent}
                </PageContainer>
            )}
            {isNotDefined(blockingContent) && showPageContainer && (
                <PageHeader
                    className={_cs(
                        styles.pageHeader,
                        className,
                    )}
                    breadCrumbs={breadCrumbs}
                    actions={actions}
                    heading={heading}
                    description={description}
                    info={info}
                    background={headerBackground}
                    headingColorVariant={headingColorVariant}
                />
            )}
            {isNotDefined(blockingContent) && (
                <PageContainer
                    contentAs="main"
                    className={_cs(
                        styles.mainSectionContainer,
                        mainSectionContainerClassName,
                        withBackgroundColorInMainSection && styles.withBackgroundColor,
                    )}
                    contentClassName={_cs(
                        styles.mainSection,
                        mainSectionClassName,
                    )}
                >
                    <ListView
                        layout="block"
                        spacing="4xl"
                    >
                        { children }
                    </ListView>
                </PageContainer>
            )}
        </div>
    );
}

export default Page;
