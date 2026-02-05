// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {GlobalState} from '@mattermost/types/store';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getProfilesByUsernames, getUser as getUserAction} from 'mattermost-redux/actions/users';
import {getUser, getUserByUsername} from 'mattermost-redux/selectors/entities/users';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {displayUsername} from 'src/utils/user_utils';
import {
    TimelineEvent,
    TimelineEventType,
    TimelineEventsFilter,
    TimelineEventsFilterDefault,
    ParticipantsChangedDetails,
    UserJoinedLeftDetails,
} from 'src/types/rhs';
import {PlaybookRun} from 'src/types/playbook_run';
import {CheckboxOption} from 'src/components/multi_checkbox';

export const useTimelineEvents = (playbookRun: PlaybookRun, eventsFilter: TimelineEventsFilter) => {
    const dispatch = useDispatch<DispatchFunc>();
    const displayPreference = useSelector(getTeammateNameDisplaySetting) || 'username';
    const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
    const getUserFn = (userId: string) => dispatch(getUserAction(userId));
    const selectUser = useSelector((state: GlobalState) => (userId: string) => getUser(state, userId));
    const selectUserByUsername = useSelector((state: GlobalState) => (username: string) => getUserByUsername(state, username));

    useEffect(() => {
        setFilteredEvents(allEvents.filter((e) => showEvent(e.event_type, eventsFilter)));
    }, [eventsFilter, allEvents]);

    useEffect(() => {
        const {
            status_posts: statuses,
            timeline_events: events,
        } = playbookRun;

        const statusDeleteAtByPostId = statuses.reduce<{[id: string]: number}>((map, post) => {
            if (post.delete_at !== 0) {
                map[post.id] = post.delete_at;
            }
            return map;
        }, {});

        const requesterUsernames = events.map((event) => {
            if (!event.details) {
                return '';
            }
            try {
                const parsed = JSON.parse(event.details) as ParticipantsChangedDetails | UserJoinedLeftDetails;
                return parsed.requester || '';
            } catch (e) {
                return '';
            }
        }).filter((username) => username);

        const unknownRequesterUsernames = requesterUsernames.filter((username) => !selectUserByUsername(username));
        if (unknownRequesterUsernames.length > 0) {
            dispatch(getProfilesByUsernames(unknownRequesterUsernames));
        }

        Promise.all(events.map(async (event) => {
            let user = selectUser(event.subject_user_id);

            if (!user) {
                const ret = await getUserFn(event.subject_user_id);
                if (!ret.data) {
                    return null;
                }
                user = ret.data;
            }

            let requesterDisplayName = '';
            if (event.details) {
                try {
                    const parsed = JSON.parse(event.details) as ParticipantsChangedDetails | UserJoinedLeftDetails;
                    if (parsed.requester) {
                        const requesterUser = selectUserByUsername(parsed.requester);
                        requesterDisplayName = requesterUser ? displayUsername(requesterUser, displayPreference) : parsed.requester;
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
            return {
                ...event,
                status_delete_at: statusDeleteAtByPostId[event.post_id] ?? 0,
                subject_display_name: displayUsername(user, displayPreference),
                requester_display_name: requesterDisplayName,
            } as TimelineEvent;
        })).then((eventArray) => {
            eventArray.reverse();
            setAllEvents(eventArray.filter((e) => e) as TimelineEvent[]);
        });
    }, [playbookRun.timeline_events, displayPreference, playbookRun.status_posts]);

    return [filteredEvents];
};

const showEvent = (eventType: string, filter: TimelineEventsFilter) => {
    if (filter.all) {
        return true;
    }
    const filterRecord = filter as unknown as Record<string, boolean>;
    const statusUpdateTypes = [
        TimelineEventType.StatusUpdateRequested,
        TimelineEventType.RunCreated,
        TimelineEventType.RunFinished,
        TimelineEventType.RunRestored,
    ];
    return filterRecord[eventType] || (filterRecord[TimelineEventType.StatusUpdated] && statusUpdateTypes.includes(eventType as TimelineEventType));
};

export const useFilter = () => {
    const {formatMessage} = useIntl();
    const [eventsFilter, setEventsFilter] = useState<TimelineEventsFilter>(TimelineEventsFilterDefault);

    const resetFilters = () => setEventsFilter(TimelineEventsFilterDefault);

    const selectOption = (value: string, checked: boolean) => {
        if (eventsFilter.all && value !== 'all') {
            return;
        }
        setEventsFilter({
            ...eventsFilter,
            [value]: checked,
        });
    };

    const options = [
        {
            display: formatMessage({defaultMessage: 'All events'}),
            value: 'all',
            selected: eventsFilter.all,
            disabled: false,
        },
        {
            value: 'divider',
        } as CheckboxOption,
        {
            display: formatMessage({defaultMessage: 'Role changes'}),
            value: TimelineEventType.OwnerChanged,
            selected: eventsFilter.owner_changed,
            disabled: eventsFilter.all,
        },
        {
            display: formatMessage({defaultMessage: 'Status updates'}),
            value: TimelineEventType.StatusUpdated,
            selected: eventsFilter.status_updated,
            disabled: eventsFilter.all,
        },
        {
            display: formatMessage({defaultMessage: 'Saved messages'}),
            value: TimelineEventType.EventFromPost,
            selected: eventsFilter.event_from_post,
            disabled: eventsFilter.all,
        },
        {
            display: formatMessage({defaultMessage: 'Task state changes'}),
            value: TimelineEventType.TaskStateModified,
            selected: eventsFilter.task_state_modified,
            disabled: eventsFilter.all,
        },
        {
            display: formatMessage({defaultMessage: 'Task assignments'}),
            value: TimelineEventType.AssigneeChanged,
            selected: eventsFilter.assignee_changed,
            disabled: eventsFilter.all,
        },
        {
            display: formatMessage({defaultMessage: 'Slash commands'}),
            value: TimelineEventType.RanSlashCommand,
            selected: eventsFilter.ran_slash_command,
            disabled: eventsFilter.all,
        },
    ];
    return {options, selectOption, eventsFilter, resetFilters};
};
