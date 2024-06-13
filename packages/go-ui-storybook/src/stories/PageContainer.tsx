import {
    PageContainer as PurePageContainer,
    PageContainerProps as PurePageContainerProps,
} from '@ifrc-go/ui';

interface PageContainerProps extends PurePageContainerProps {}

function PageContainer(props: PageContainerProps) {
    return (
        <PurePageContainer {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PageContainer;
