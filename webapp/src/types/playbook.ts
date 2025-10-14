// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface Playbook {
    id: string;
    title: string;
    description: string;
    team_id: string;
    create_public_playbook_run: boolean;
    delete_at: number;
    run_summary_template_enabled: boolean;
    public: boolean;
    default_owner_id: string;
    default_owner_enabled: boolean;

    /** @alias num_checklists */
    num_stages: number;
    num_steps: number;
    num_runs: number;
    num_actions: number;
    last_run_at: number;
    members: PlaybookMember[];
    default_playbook_member_role: string;
    active_runs: number;
}

export interface PlaybookMember {
    user_id: string
    roles: string[]
    scheme_roles?: string[]
}

export interface PlaybookWithChecklist extends Playbook {
    checklists: Checklist[];
    reminder_message_template: string;
    reminder_timer_default_seconds: number;
    status_update_enabled: boolean;
    invited_user_ids: string[];
    invited_group_ids: string[];
    invite_users_enabled: boolean;
    default_owner_id: string;
    default_owner_enabled: boolean;
    broadcast_channel_ids: string[];
    webhook_on_creation_urls: string[];
    webhook_on_status_update_urls: string[];
    webhook_on_status_update_enabled: boolean;
    message_on_join: string;
    message_on_join_enabled: boolean;
    retrospective_reminder_interval_seconds: number;
    retrospective_template: string;
    retrospective_enabled: boolean
    signal_any_keywords_enabled: boolean;
    signal_any_keywords: string[];
    category_name: string;
    categorize_channel_enabled: boolean;
    run_summary_template: string;
    channel_name_template: string;
    metrics: Metric[];
    is_favorite: boolean;
    create_channel_member_on_new_participant: boolean;
    remove_channel_member_on_removed_participant: boolean;

    channel_mode: string;
    channel_id: string;

    // Deprecated: preserved for backwards compatibility with v1.27
    broadcast_enabled: boolean;
    webhook_on_creation_enabled: boolean;

    // Property fields from GraphQL
    propertyFields: PropertyField[];
}

import {MetricType, PropertyField} from 'src/graphql/generated/graphql';

export {MetricType};

export interface Metric {
    id: string;
    type: MetricType;
    title: string;
    description: string;
    target?: number | null;
}

export interface FetchPlaybooksParams {
    team_id?: string;
    page?: number;
    per_page?: number;
    sort?: 'title' | 'stages' | 'steps' | 'runs' | 'last_run_at' | 'active_runs';
    direction?: 'asc' | 'desc';
    search_term?: string;
    with_archived?: boolean;
}

export interface FetchPlaybooksReturn {
    total_count: number;
    page_count: number;
    has_more: boolean;
    items: Playbook[];
}

export interface Checklist {
    id?: string;
    title: string;
    items: ChecklistItem[];
    update_at?: number; // Timestamp for idempotency checks
    items_order?: string[]; // Order of checklist items
}

export enum ChecklistItemState {
    Open = '',
    InProgress = 'in_progress',
    Closed = 'closed',
    Skip = 'skipped',
}

export interface ChecklistItem {
    id?: string;
    title: string;
    description: string;
    state: ChecklistItemState | string;
    state_modified: number;
    assignee_id: string;
    assignee_modified: number;
    command: string;
    command_last_run: number;
    due_date: number;
    task_actions: TaskAction[];
    update_at?: number; // Timestamp for idempotency checks
    condition_id: string;
    condition_action: string;
    condition_reason: string;
}

export interface TaskAction {
    trigger: Trigger;
    actions: Action[];
}

export interface Trigger {
    type: string;
    payload: string;
}

export interface Action {
    type: string;
    payload: string;
}

export interface DraftPlaybookWithChecklist extends Omit<PlaybookWithChecklist, 'id'> {
    id?: string;
}

// setPlaybookDefaults fills in a playbook with defaults for any fields left empty.
export const setPlaybookDefaults = (playbook: DraftPlaybookWithChecklist, t?: (key: string) => string) => ({
    ...playbook,
    title: playbook.title.trim() || (t ? t('wX3k9U') : 'Untitled playbook'),
    checklists: playbook.checklists.map((checklist) => ({
        ...checklist,
        title: checklist.title || (t ? t('wX3k9V') : 'Untitled checklist'),
        items: checklist.items.map((item) => ({
            ...item,
            title: item.title || (t ? t('wX3k9W') : 'Untitled task'),
        })),
    })),
});

export function emptyPlaybook(t?: (key: string) => string): DraftPlaybookWithChecklist {
    return {
        title: '',
        description: '',
        team_id: '',
        public: true,
        create_public_playbook_run: false,
        delete_at: 0,
        num_stages: 0,
        num_steps: 0,
        num_runs: 0,
        num_actions: 0,
        last_run_at: 0,
        checklists: [emptyChecklist()],
        members: [],
        reminder_message_template: '',
        reminder_timer_default_seconds: 7 * 24 * 60 * 60, // 7 days
        status_update_enabled: true,
        invited_user_ids: [],
        invited_group_ids: [],
        invite_users_enabled: false,
        default_owner_id: '',
        default_owner_enabled: false,
        broadcast_channel_ids: [],
        broadcast_enabled: true,
        webhook_on_creation_urls: [],
        webhook_on_creation_enabled: false,
        webhook_on_status_update_urls: [],
        webhook_on_status_update_enabled: true,
        message_on_join: defaultMessageOnJoin,
        message_on_join_enabled: false,
        retrospective_reminder_interval_seconds: 0,
        retrospective_template: defaultRetrospectiveTemplate(t),
        retrospective_enabled: true,
        signal_any_keywords: [],
        signal_any_keywords_enabled: false,
        category_name: '',
        categorize_channel_enabled: false,
        run_summary_template_enabled: false,
        run_summary_template: '',
        channel_name_template: '',
        default_playbook_member_role: '',
        metrics: [],
        is_favorite: false,
        active_runs: 0,
        create_channel_member_on_new_participant: true,
        remove_channel_member_on_removed_participant: true,
        channel_id: '',
        channel_mode: 'create_new_channel',
        propertyFields: [],
    };
}

export function emptyChecklist(): Checklist {
    return {
        title: '기본 체크리스트',
        items: [emptyChecklistItem()],
    };
}

export function emptyChecklistItem(): ChecklistItem {
    return {
        title: '',
        state: ChecklistItemState.Open,
        command: '',
        description: '',
        command_last_run: 0,
        due_date: 0,
        task_actions: [] as TaskAction[],
        state_modified: 0,
        assignee_modified: 0,
        assignee_id: '',
        condition_id: '',
        condition_action: '',
        condition_reason: '',
    };
}

export const newChecklistItem = (title = '', description = '', command = '', state = ChecklistItemState.Open): ChecklistItem => ({
    title,
    description,
    command,
    command_last_run: 0,
    state,
    due_date: 0,
    task_actions: [] as TaskAction[],
    state_modified: 0,
    assignee_modified: 0,
    assignee_id: '',
    condition_id: '',
    condition_action: '',
    condition_reason: '',
});

export interface ChecklistItemsFilter extends Record<string, boolean> {
    all: boolean;
    checked: boolean;
    skipped: boolean;
    me: boolean;
    unassigned: boolean;
    others: boolean;
    overdueOnly: boolean;
}

export const ChecklistItemsFilterDefault: ChecklistItemsFilter = {
    all: false,
    checked: true,
    skipped: true,
    me: true,
    unassigned: true,
    others: true,
    overdueOnly: false,
};

export const newMetric = (type: MetricType, title = '', description = '', target = null): Metric => ({
    id: '',
    type,
    title,
    description,
    target,
});

export const defaultMessageOnJoin = `Welcome! This channel was automatically created as part of a playbook run. You can [learn more about playbooks here](https://docs.mattermost.com/guides/playbooks.html). To see information about this run, such as current owner and checklist of tasks, select the shield icon in the channel header.

Here are some resources that you may find helpful:
[Mattermost community channel](https://community.mattermost.com/core/channels/developers-playbooks)
[User guide and documentation](https://docs.mattermost.com/guides/playbooks.html)`;

export const defaultRetrospectiveTemplate = (t?: (key: string) => string) => {
    if (!t) {
        return `### 요약
이 섹션에는 무슨 일이 있었는지, 원인이 무엇이었는지, 그리고 어떤 조치가 이루어졌는지에 대한 2~3문장의 간단한 개요를 작성하세요. 간결할수록 좋으며, 미래의 팀이 참고할 때 가장 먼저 보게 될 내용입니다.

### 영향
이 플레이북 실행이 내부 및 외부 고객, 그리고 이해관계자에게 어떤 영향을 미쳤는지 설명하세요.

### 기여 요인
이 플레이북이 바람직하지 않은 상황에 대한 대응 프로토콜이라면, 이 섹션에서 그 상황이 발생한 원인을 설명하세요. 여러 개의 근본 원인이 있을 수 있으며, 이를 통해 이해관계자들이 이유를 파악할 수 있습니다.

### 수행한 일
이 섹션에서는 팀이 사건을 해결하기 위해 어떻게 협업했는지에 대한 이야기를 작성하세요. 이를 통해 미래의 팀이 어떤 시도를 해볼 수 있을지 배울 수 있습니다.

### 배운 점
이 섹션에는 모든 참여자의 관점을 포함하여 잘된 점, 개선이 필요한 점, 다음에 다르게 해야 할 점 등을 작성하세요.

### 후속 작업
이 섹션에는 배운 점을 바탕으로 팀이 더 나은 반복을 할 수 있도록 변경해야 할 액션 아이템을 나열하세요. 플레이북 수정, 회고 게시, 기타 개선 사항 등이 포함될 수 있습니다. 가장 좋은 후속 작업은 명확한 담당자와 마감일이 지정되어 있습니다.

### 주요 타임라인
이 섹션은 가장 중요한 순간들을 기록한 큐레이션된 로그입니다. 주요 커뮤니케이션, 스크린샷, 기타 자료를 포함할 수 있습니다. 내장된 타임라인 기능을 활용하여 사건의 흐름을 되짚어보세요.`;
    }
    
    return t('wX3k9Y');
};
