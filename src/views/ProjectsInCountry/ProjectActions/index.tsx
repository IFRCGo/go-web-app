import {
    MoreFillIcon,
    SearchLineIcon,
    PencilFillIcon,
    CopyLineIcon,
    HistoryLineIcon,
} from '@ifrc-go/icons';

import { useLazyRequest } from '#utils/restRequest';
import BlockLoading from '#components/BlockLoading';
import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import ConfirmButton from '#components/ConfirmButton';
import useAlert from '#hooks/useAlert';
import { adminUrl } from '#config';
import type { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

interface Props {
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
        pathVariables: {
            id: project.id,
        },
        method: 'DELETE',
        onSuccess: onProjectDeletionSuccess,
        onFailure: ({ value }) => {
            alert.show(
                `Failed to delete the project. ${value.messageForNotification}`,
                { variant: 'danger' },
            );
        },
    });

    return (
        <>
            {projectDeletionPending && <BlockLoading />}
            <DropdownMenu
                className={className}
                variant="tertiary"
                hideDropdownIcon
                label={<MoreFillIcon />}
            >
                <DropdownMenuItem
                    name={undefined}
                    type="button"
                    icons={<SearchLineIcon />}
                >
                    {strings.projectListTableViewDetails}
                </DropdownMenuItem>
                <DropdownMenuItem
                    name={undefined}
                    type="button"
                    icons={<PencilFillIcon />}
                >
                    {strings.projectListTableEdit}
                </DropdownMenuItem>
                <DropdownMenuItem
                    name={undefined}
                    type="button"
                    icons={<CopyLineIcon />}
                >
                    {strings.projectListTableDuplicate}
                </DropdownMenuItem>
                <DropdownMenuItem
                    type="link"
                    icons={<HistoryLineIcon />}
                    to={adminUrl.concat(`deployments/project/${project.id}/history/`)}
                >
                    {strings.projectListTableHistory}
                </DropdownMenuItem>
                <ConfirmButton
                    name={undefined}
                    className={styles.deleteButton}
                    confirmHeading={strings.threeWDeleteProject}
                    confirmMessage={strings.threeWDeleteProjectMessage}
                    onConfirm={requestProjectDeletion}
                    disabled={projectDeletionPending}
                >
                    {strings.deleteProject}
                </ConfirmButton>
            </DropdownMenu>
        </>
    );
}

export default ProjectActions;
