import { useEffect } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import PageHeader from '#components/PageHeader';
import styles from './styles.module.css';

interface Props {
    className?: string;
    title?: string;
    actions?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    descriptionContainerClassName?: string;
    breadCrumbs?: React.ReactNode;
    info?: React.ReactNode;
    children?: React.ReactNode;
    mainSectionClassName?: string;
    infoContainerClassName?: string;
    wikiLink?: React.ReactNode;
}

function Page(props: Props) {
    const {
        className,
        title,
        actions,
        heading,
        description,
        descriptionContainerClassName,
        breadCrumbs,
        info,
        children,
        mainSectionClassName,
        infoContainerClassName,
        wikiLink,
    } = props;

    useEffect(() => {
        if (isDefined(title)) {
            document.title = title;
        }
    }, [title]);

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
        >
            {showPageContainer && (
                <PageHeader
                    className={_cs(
                        styles.pageHeader,
                        className,
                    )}
                    breadCrumbs={breadCrumbs}
                    actions={actions}
                    heading={heading}
                    description={description}
                    descriptionContainerClassName={descriptionContainerClassName}
                    info={info}
                    infoContainerClassName={infoContainerClassName}
                />
            )}
            <PageContainer
                contentAs="main"
                contentClassName={_cs(
                    styles.mainSection,
                    mainSectionClassName,
                )}
            >
                { children }
            </PageContainer>
        </div>
    );
}

export default Page;
