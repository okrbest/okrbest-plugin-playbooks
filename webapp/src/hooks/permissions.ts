// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useMemo} from 'react';

import {
    getRoles,
    haveIChannelPermission,
    haveISystemPermission,
    haveITeamPermission,
} from 'mattermost-redux/selectors/entities/roles';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {GlobalState} from '@mattermost/types/store';
import {useDispatch, useSelector} from 'react-redux';

import {PlaybookPermissionGeneral, makeGeneralPermissionSpecific} from 'src/types/permissions';

import {usePlaybook} from './crud';

export const useHasSystemPermission = (permission: string) => {
    return useSelector((state: GlobalState) => haveISystemPermission(state, {permission}));
};

export const useHasTeamPermission = (teamID: string, permission: string) => {
    return useSelector((state: GlobalState) => haveITeamPermission(state, teamID, permission));
};

export const useHasChannelPermission = (teamID: string, channelID: string, permission: string) => {
    return useSelector((state: GlobalState) => haveIChannelPermission(state, teamID, channelID, permission));
};

export const useHasPlaybookPermissionById = (permission: PlaybookPermissionGeneral, playbookId: string) => {
    const [playbook] = usePlaybook(playbookId);
    return useHasPlaybookPermission(permission, playbook);
};

export interface PlaybookPermissionsMember {
    user_id: string
    scheme_roles?: string[]
}

export interface PlaybookPermissionsParams {
    public: boolean
    team_id: string
    default_playbook_member_role: string
    members: PlaybookPermissionsMember[]
}

export const useHasPlaybookPermission = (permission: PlaybookPermissionGeneral, playbook: Maybe<PlaybookPermissionsParams>) => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const roles = useSelector(getRoles);
    const specificPermission = makeGeneralPermissionSpecific(permission, playbook?.public || false);
    const hasTeamPermision = useHasTeamPermission(playbook?.team_id || '', specificPermission);

    // Calculate user roles using useMemo to stabilize the array reference
    const userRoles = useMemo(() => {
        if (!playbook) {
            return [];
        }

        const member = playbook?.members.find((val: PlaybookPermissionsMember) => val.user_id === currentUserId);

        if (member) {
            return member.scheme_roles || [];
        } else if (playbook.public) {
            return [playbook.default_playbook_member_role];
        }

        return [];
    }, [playbook, currentUserId]);

    // Load roles if needed using useEffect to avoid side effects during render
    useEffect(() => {
        if (userRoles.length > 0) {
            dispatch(loadRolesIfNeeded(userRoles));
        }
    }, [dispatch, userRoles]);

    // Early returns after all hooks have been called
    if (hasTeamPermision) {
        return true;
    }

    if (!playbook) {
        return false;
    }

    if (userRoles.length === 0) {
        return false;
    }

    for (const userRole of userRoles) {
        const role = roles[userRole];
        if (role?.permissions.includes(specificPermission)) {
            return true;
        }
    }

    return false;
};
