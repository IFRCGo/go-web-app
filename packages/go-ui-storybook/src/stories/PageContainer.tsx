import {
    PageContainer as PurePageContainer,
    PageContainerProps,
} from '@ifrc-go/ui';

function PageContainer(props: PageContainerProps) {
    return (
        <PurePageContainer {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PageContainer;
