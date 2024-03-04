import {
    CopyLineIcon,
    DeleteBinLineIcon,
    HistoryLineIcon,
    MoreFillIcon,
    PencilFillIcon,
    SearchLineIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    ConfirmButton,
    DropdownMenu,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { adminUrl } from '#config';
import useAlert from '#hooks/useAlert';
import { resolveUrl } from '#utils/resolveUrl';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

export interface Props {
    className?: string;
    onProjectDeletionSuccess: () => void;
    project: Project;
}

function ProjectActions(props: Props) {
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        className,
        project,
        onProjectDeletionSuccess,
    } = props;

    const {
        pending: projectDeletionPending,
        trigger: requestProjectDeletion,
    } = useLazyRequest({
        url: '/api/v2/project/{id}/',
        method: 'DELETE',
        pathVariables: { id: project.id },
        onSuccess: onProjectDeletionSuccess,
        onFailure: ({ value }) => {
            alert.show(
                resolveToString(strings.projectDeleteFailureMessage, {
                    message: value.messageForNotification,
                }),
                { variant: 'danger' },
            );
        },
    });

    return (
        <>
            {/* FIXME: this BlockLoading doesn't look good */}
            {projectDeletionPending && <BlockLoading />}

            <DropdownMenu
                className={className}
                variant="tertiary"
                withoutDropdownIcon
                label={<MoreFillIcon className={styles.icon} />}
                persistent
            >
                <DropdownMenuItem
                    type="link"
                    to="threeWProjectDetail"
                    urlParams={{ projectId: project.id }}
                    icons={<SearchLineIcon />}
                >
                    {strings.projectViewDetails}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    to="threeWProjectEdit"
                    urlParams={{ projectId: project.id }}
                    icons={<PencilFillIcon />}
                >
                    {strings.actionDropdownEditLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    to="newThreeWProject"
                    state={{ projectId: project.id }}
                    icons={<CopyLineIcon />}
                >
                    {strings.projectDuplicate}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    icons={<HistoryLineIcon />}
                    href={resolveUrl(adminUrl, `deployments/project/${project.id}/history/`)}
                    external
                >
                    {strings.projectHistory}
                </DropdownMenuItem>
                <ConfirmButton
                    name={null}
                    confirmHeading={strings.deleteProject}
                    confirmMessage={strings.deleteProjectMessage}
                    onConfirm={requestProjectDeletion}
                    disabled={projectDeletionPending}
                    variant="dropdown-item"
                    icons={<DeleteBinLineIcon />}
                >
                    {strings.deleteProject}
                </ConfirmButton>
            </DropdownMenu>
        </>
    );
}

export default ProjectActions;
