import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type SupportedElements = 'div' | 'nav' | 'header' | 'footer' | 'main';

export interface Props {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  contentAs?: SupportedElements;
  containerAs?: SupportedElements;
}

function PageContainer(props: Props) {
    const {
        className,
        contentClassName,
        children,
        contentAs = 'div',
        containerAs = 'div',
    } = props;

    const ContentElement = contentAs as React.ElementType;
    const ContainerElement = containerAs as React.ElementType;

    return (
        <ContainerElement className={_cs(styles.pageContainer, className)}>
            <ContentElement className={_cs(styles.content, contentClassName)}>
                {children}
            </ContentElement>
        </ContainerElement>
    );
}

export default PageContainer;
