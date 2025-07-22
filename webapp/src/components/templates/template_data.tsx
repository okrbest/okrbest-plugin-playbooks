// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import {mtrim} from 'js-trim-multiline-string';

import {DraftPlaybookWithChecklist, emptyPlaybook, newChecklistItem} from 'src/types/playbook';

import MattermostLogo from 'src/components/assets/mattermost_logo_svg';
import ClipboardChecklist from 'src/components/assets/illustrations/clipboard_checklist_svg';
import ProductRelease from 'src/components/assets/illustrations/product_release_svg';
import BugBash from 'src/components/assets/illustrations/bug_bash_svg';
import LearnPlaybooks from 'src/components/assets/illustrations/learn_playbooks_svg';
import IncidentResolutionSvg from 'src/components/assets/illustrations/incident_resolution_svg';
import FeatureLifecycle from 'src/components/assets/illustrations/feature_lifecycle_svg';
import CustomerOnboarding from 'src/components/assets/illustrations/customer_onboarding_svg';
import EmployeeOnboarding from 'src/components/assets/illustrations/employee_onboarding_svg';

export interface PresetTemplate {
    label?: string;
    labelColor?: string;
    title: string;
    description?: string;

    author?: ReactNode;
    icon: ReactNode;
    color?: string;
    template: DraftPlaybookWithChecklist;
}

const preprocessTemplates = (presetTemplates: PresetTemplate[]): PresetTemplate[] => (
    presetTemplates.map((pt) => ({
        ...pt,
        template: {
            ...pt.template,
            num_stages: pt.template?.checklists.length,
            num_actions:
                1 + // Channel creation is hard-coded
                (pt.template.message_on_join_enabled ? 1 : 0) +
                (pt.template.signal_any_keywords_enabled ? 1 : 0) +
                (pt.template.run_summary_template_enabled ? 1 : 0),
            checklists: pt.template?.checklists.map((checklist) => ({
                ...checklist,
                items: checklist.items?.map((item) => ({
                    ...newChecklistItem(),
                    ...item,
                })) || [],
            })),
        },
    }))
);

export const PresetTemplates: PresetTemplate[] = preprocessTemplates([
    {
        title: 'BLANK.TITLE',
        icon: <ClipboardChecklist/>,
        color: '#FFBC1F14',
        description: 'BLANK.DESCRIPTION',
        template: {
            ...emptyPlaybook(),
            title: 'BLANK.TITLE',
            description: 'BLANK.DESCRIPTION',
        },
    },
    {
        title: 'PRODUCT.RELEASE.TITLE',
        description: 'PRODUCT.RELEASE.DESCRIPTION',
        icon: <ProductRelease/>,
        color: '#C4313314',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'PRODUCT.RELEASE.TITLE',
            description: 'PRODUCT.RELEASE.DESCRIPTION',
            checklists: [
                {
                    title: '코드 준비',
                    items: [
                        newChecklistItem('남아있는 티켓과 병합 대기 중인 PR을 분류 및 확인'),
                        newChecklistItem('변경 로그, 기능 문서, 마케팅 자료 초안 작성 시작'),
                        newChecklistItem('필요시 프로젝트 의존성 검토 및 업데이트'),
                        newChecklistItem('QA가 릴리즈 테스트 할당 준비'),
                        newChecklistItem('데이터베이스 업그레이드 병합'),
                    ],
                },
                {
                    title: '릴리즈 테스트',
                    items: [
                        newChecklistItem('릴리즈 후보(RC-1) 생성'),
                        newChecklistItem('QA가 프리릴리즈 빌드에 대해 스모크 테스트 수행'),
                        newChecklistItem('QA가 프리릴리즈 빌드에 대해 자동 부하 테스트 및 업그레이드 테스트 수행'),
                        newChecklistItem('회귀 버그 수정사항 분류 및 병합'),
                    ],
                },
                {
                    title: '프로덕션 릴리즈 준비',
                    items: [
                        newChecklistItem('QA가 최종 릴리즈 승인'),
                        newChecklistItem('최종 릴리즈 빌드 생성 및 배포'),
                        newChecklistItem('변경 로그, 업그레이드 노트, 기능 문서 배포'),
                        newChecklistItem('최소 서버 요구사항이 문서에 반영되었는지 확인'),
                        newChecklistItem('관련 문서 및 웹페이지의 릴리즈 다운로드 링크 업데이트'),
                        newChecklistItem('공지 및 마케팅 자료 게시'),
                    ],
                },
                {
                    title: '릴리즈 후',
                    items: [
                        newChecklistItem('릴리즈 회고 일정 잡기'),
                        newChecklistItem('다음 릴리즈 일정을 릴리즈 캘린더에 추가하고 이해관계자에게 전달'),
                        newChecklistItem('릴리즈 지표 작성'),
                        newChecklistItem('보안 업데이트 커뮤니케이션 준비'),
                        newChecklistItem('인시던트 채널을 보관하고 다음 릴리즈를 위한 새 채널 생성'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: '릴리즈 (vX.Y)',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`안녕하세요!

                이 채널은 **제품 릴리즈** 플레이북의 일부로 생성되었으며, 해당 릴리즈와 관련된 대화가 이루어집니다. 이 메시지는 마크다운으로 자유롭게 수정할 수 있으며, 새로운 채널 멤버가 유용한 맥락과 리소스를 안내받을 수 있도록 맞춤화할 수 있습니다.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**소개**
                - 버전 번호: 미정
                - 목표 날짜: 미정

                **리소스**
                - Jira 필터 뷰: [링크 미정](#)
                - 블로그 포스트 초안: [링크 미정](#)`,
            reminder_message_template:
                mtrim`### 마지막 업데이트 이후 변경사항
                -

                ### 남아있는 PR
                - `,
            reminder_timer_default_seconds: 24 * 60 * 60, // 24 hours
            retrospective_template:
                mtrim`### 시작(START)
                -

                ### 중단(STOP)
                -

                ### 유지(KEEP)
                - `,
            retrospective_reminder_interval_seconds: 0, // Once
        },
    },
    {
        title: 'INCIDENT.RESOLUTION.TITLE',
        description: 'INCIDENT.RESOLUTION.DESCRIPTION',
        icon: <IncidentResolutionSvg/>,
        author: <MattermostLogo/>,
        color: '#33997014',
        template: {
            ...emptyPlaybook(),
            title: 'INCIDENT.RESOLUTION.TITLE',
            description: 'INCIDENT.RESOLUTION.DESCRIPTION',
            checklists: [
                {
                    title: '트리아지 준비',
                    items: [
                        newChecklistItem('온콜 엔지니어를 채널에 추가'),
                        newChecklistItem('브릿지 콜 시작', '', '/zoom start'),
                        newChecklistItem('현재 상황으로 설명 업데이트'),
                        newChecklistItem('인시던트 티켓 생성', '', '/jira create'),
                        newChecklistItem('설명에 심각도 지정 (예: #sev-2)'),
                        newChecklistItem('(만약 #sev-1) @vip에게 알림'),
                    ],
                },
                {
                    title: '원인 조사',
                    items: [
                        newChecklistItem('의심되는 원인을 여기에 추가하고 제거 시 체크'),
                    ],
                },
                {
                    title: '해결',
                    items: [
                        newChecklistItem('문제가 해결되었는지 확인'),
                        newChecklistItem('고객 성공 매니저에게 알림'),
                        newChecklistItem('(sev-1인 경우) 리더 팀에 알림'),
                    ],
                },
                {
                    title: '회고',
                    items: [
                        newChecklistItem('참여자에게 설문조사 발송'),
                        newChecklistItem('포스트모템 미팅 일정 잡기'),
                        newChecklistItem('주요 메시지를 타임라인 항목으로 저장'),
                        newChecklistItem('회고 보고서 게시'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: 'Incident: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`안녕하세요!

                이 채널은 **인시던트 해결(Incident Resolution)** 플레이북의 일부로 생성되었으며, 이 릴리즈와 관련된 대화가 이루어집니다. 이 메시지는 마크다운으로 자유롭게 수정할 수 있으며, 새로운 채널 멤버가 유용한 맥락과 리소스를 안내받을 수 있도록 맞춤화할 수 있습니다.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**요약**

                **고객 영향**

                **세부 정보**
                - 심각도: #sev-1/2/3
                - 대응자:
                - 해결 예상 시간:`,
            reminder_message_template: '',
            reminder_timer_default_seconds: 60 * 60, // 1 hour
            retrospective_template:
                mtrim`### 요약
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
                이 섹션은 가장 중요한 순간들을 기록한 큐레이션된 로그입니다. 주요 커뮤니케이션, 스크린샷, 기타 자료를 포함할 수 있습니다. 내장된 타임라인 기능을 활용하여 사건의 흐름을 되짚어보세요.`,
            retrospective_reminder_interval_seconds: 24 * 60 * 60, // 24 hours
            signal_any_keywords_enabled: true,
            signal_any_keywords: ['sev-1', 'sev-2', '#incident', 'this is serious'],
        },
    },
    {
        title: 'CUSTOMER.ONBOARDING.TITLE',
        description: 'CUSTOMER.ONBOARDING.DESCRIPTION',
        icon: <CustomerOnboarding/>,
        color: '#3C507A14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'CUSTOMER.ONBOARDING.TITLE',
            description: mtrim`새로운 Mattermost 고객은 이 플레이북과 유사한 프로세스를 따라 온보딩됩니다.

            이 플레이북을 귀사의 고객 온보딩 프로세스에 맞게 자유롭게 커스터마이즈하세요.`,
            checklists: [
                {
                    title: '영업-고객 성공팀 인수인계',
                    items: [
                        newChecklistItem('AE가 CSM 및 CSE를 주요 연락처에 소개'),
                        newChecklistItem('고객 계정용 드라이브 폴더 생성'),
                        newChecklistItem('Closed Won 후 24시간 이내 환영 이메일 발송'),
                        newChecklistItem('고객과 초기 킥오프 콜 일정 잡기'),
                        newChecklistItem('계정 플랜 작성 (1, 2등급)'),
                        newChecklistItem('디스커버리 설문 발송'),
                    ],
                },
                {
                    title: '고객 기술 온보딩',
                    items: [
                        newChecklistItem('기술 디스커버리 콜 일정 잡기'),
                        newChecklistItem('현재 Zendesk 티켓 및 업데이트 검토'),
                        newChecklistItem('고객 기술 세부정보를 Salesforce에 기록'),
                        newChecklistItem('고객이 기술 디스커버리 요약 패키지를 수령했는지 확인'),
                        newChecklistItem('최신 Mattermost "Pen Test" 리포트 고객에게 발송'),
                        newChecklistItem('플러그인/통합 기획 세션 일정 잡기'),
                        newChecklistItem('데이터 마이그레이션 계획 확인'),
                        newChecklistItem('통합을 통해 Mattermost 확장'),
                        newChecklistItem('기능 및 부하 테스트 계획 확인'),
                        newChecklistItem('팀/채널 구성 확인'),
                        newChecklistItem('릴리즈 및 공지용 Mattermost 블로그 구독'),
                        newChecklistItem('다음 업그레이드 버전 확인'),
                    ],
                },
                {
                    title: 'Go-Live',
                    items: [
                        newChecklistItem('프로젝트 팀용 Mattermost 굿즈 패키지 주문'),
                        newChecklistItem('최종 사용자 롤아웃 계획 확인'),
                        newChecklistItem('고객 Go-Live 확인'),
                        newChecklistItem('Go-Live 이후 회고 진행'),
                    ],
                },
                {
                    title: 'Go-Live 이후 선택적 가치 제안',
                    items: [
                        newChecklistItem('플레이북 및 보드 소개'),
                        newChecklistItem('Mattermost 101 업그레이드 안내'),
                        newChecklistItem('DevOps 중심의 팁 & 트릭 공유'),
                        newChecklistItem('효율성 중심의 팁 & 트릭 공유'),
                        newChecklistItem('제품팀과 분기별 로드맵 리뷰 일정 잡기'),
                        newChecklistItem('임원진과 리뷰 (1, 2등급)'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: '고객 온보딩: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`안녕하세요, 환영합니다!

                이 채널은 **고객 온보딩** 플레이북의 일부로 생성되었으며, 해당 고객과 관련된 대화가 이루어집니다. 이 메시지는 마크다운으로 자유롭게 수정할 수 있으며, 새로운 채널 멤버가 유용한 맥락과 리소스를 안내받을 수 있도록 맞춤화할 수 있습니다.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**개요**
                - 계정명: [미정](#)
                - Salesforce 기회: [미정](#)
                - 주문 유형:
                - 계약 마감일:

                **팀**
                - 영업 담당자: @미정
                - 고객 성공 매니저: @미정`,
            retrospective_template:
                mtrim`### 잘된 점은 무엇이었나요?
                -

                ### 더 잘할 수 있었던 점은?
                -

                ### 다음에는 무엇을 바꿔야 할까요?
                - `,
            retrospective_reminder_interval_seconds: 0, // Once
        },
    },
    {
        title: 'EMPLOYEE.ONBOARDING.TITLE',
        description: 'EMPLOYEE.ONBOARDING.DESCRIPTION',
        icon: <EmployeeOnboarding/>,
        color: '#FFBC1F14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'EMPLOYEE.ONBOARDING.TITLE',
            description: mtrim`모든 새로운 Mattermost 직원은 입사 시 이 온보딩 프로세스를 완료합니다.

            이 플레이북을 귀사의 직원 온보딩 프로세스에 맞게 자유롭게 커스터마이즈하세요.`,
            checklists: [
                {
                    title: '첫 출근 전',
                    items: [
                        newChecklistItem('[IT 헬프데스크에서 온보딩 시스템 양식 작성 완료](https://helpdesk.mattermost.com/support/home)'),
                        newChecklistItem(
                            '신규 직원의 입사일 전에 온보딩 템플릿 작성 완료',
                            mtrim`매니저는 신규 직원이 성공적으로 적응하고 환영받을 수 있도록 명확한 기대치를 설정하고, 팀과 내부 이해관계자에게 신규 동료가 조직 및 문화적으로 잘 통합될 수 있도록 준비하는 데 중요한 역할을 합니다.
                                * **온보딩 목표:** 신규 팀원이 입사 후 90일 동안 집중해야 할 영역과 프로젝트를 명확히 합니다. 역할을 오픈할 때 작성한 _역할 개요_를 참고하세요.
                                * **AOR 명확화:** 신규 입사자와 관련된 AOR(책임 영역)을 식별하고, 신규 입사자가 [DRI](https://handbook.mattermost.com/company/about-mattermost/list-of-terms#dri) 또는 백업 DRI로 지정될 AOR을 표시하세요. 필요하다면 입사 전에 내부 이해관계자와 AOR 이관을 명확히 하세요. [AOR 페이지](https://handbook.mattermost.com/operations/operations/areas-of-responsibility) 참고. 면접 패널과 각자의 주요 역할도 포함하세요.
                                * **온보딩 피어 지정:** 온보딩 피어나 피어 그룹은 팀, 부서, Mattermost에 대해 질문에 답할 수 있는 사람이어야 합니다. 많은 경우 온보딩 피어는 특정 AOR의 [엔드-보스](https://handbook.mattermost.com/company/about-mattermost/mindsets#mini-boss-end-boss) 역할을 할 수 있습니다. 매니저는 지정 전에 해당 피어의 동의를 구해야 합니다.`,
                        ),
                    ],
                },
                {
                    title: '첫 주',
                    items: [
                        newChecklistItem(
                            '[Welcome Channel](https://community.mattermost.com/private-core/channels/welcome)에서 신규 직원을 소개하세요',
                            mtrim`모든 신규 입사자는 간단한 자기소개를 작성해 매니저에게 전달해야 합니다. 매니저는 이 자기소개를 환영 메시지에 포함해야 합니다.

                                메시지에 \#newcolleague 해시태그를 꼭 포함하세요.`,
                        ),
                        newChecklistItem(
                            '팀 [AOR](https://handbook.mattermost.com/operations/operations/areas-of-responsibility) 검토',
                            '이 시기는 신규 입사자의 AOR과 온보딩 기대치를 함께 검토하기에 좋은 시기입니다.'
                        ),
                        newChecklistItem(
                            '주요 내부 파트너 목록 검토',
                            '신규 직원이 함께 일하게 될 주요 인물들을 확인하고, 입사 후 1~2개월 내에 미팅을 잡을 수 있도록 안내하세요.',
                        ),
                        newChecklistItem(
                            'Mattermost 채널에 추가',
                            '팀원 역할과 팀에 맞는 적절한 채널에 신규 직원을 추가했는지 확인하세요.',
                        ),
                        newChecklistItem(
                            '팀의 정기 미팅 및 운영 규칙 공유',
                            '팀의 정기 미팅, 운영 규범, 관련 플레이북을 함께 검토하세요.',
                        ),
                    ],
                },
                {
                    title: '첫 달',
                    items: [
                        newChecklistItem('회사 및 팀 [V2MOMs](https://handbook.mattermost.com/company/how-to-guides-for-staff/how-to-v2mom) 검토'),
                        newChecklistItem('역할 및 책임, 기대치 정렬'),
                        newChecklistItem(
                            'COM 미팅에서 자기소개',
                            '[COM](https://handbook.mattermost.com/operations/operations/company-cadence#customer-obsession-meeting-aka-com) 미팅에서 2주차에 신규 직원이 자기소개를 하도록 안내하세요. 본인이 직접 소개하기 어렵다면 매니저가 대신 소개할 수 있습니다.',
                        ),
                        newChecklistItem(
                            '[Shoulder Check](https://handbook.mattermost.com/company/about-mattermost/mindsets#shoulder-check)',
                            '잠재적인 블라인드 스팟을 점검하고 피드백을 요청하세요.',
                        ),
                    ],
                },
                {
                    title: '둘째 달',
                    items: [
                        newChecklistItem(
                            '90일 신규 동료 피드백',
                            '매니저는 신규 직원의 입사 65일째에 [신규 동료 리뷰 프로세스](https://handbook.mattermost.com/contributors/onboarding#new-colleague-90-day-feedback-process)를 시작하라는 알림을 받습니다. 피드백에는 입사 후 90일 동안의 주요 책임 요약이 포함됩니다. 매니저는 이 책임을 입사 첫 주에 신규 직원에게 명확히 전달해야 합니다.',
                        ),
                    ],
                },
                {
                    title: '셋째 달',
                    items: [
                        newChecklistItem('신규 동료 피드백 전달'),
                    ],
                },
            ],
            create_public_playbook_run: false,
            channel_name_template: '직원 온보딩: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`안녕하세요, 환영합니다!

                이 채널은 **직원 온보딩** 플레이북의 일부로 생성되었으며, 이 직원의 온보딩과 관련된 대화가 이루어집니다. 이 메시지는 마크다운으로 자유롭게 수정할 수 있으며, 새로운 채널 멤버가 유용한 맥락과 리소스를 안내받을 수 있도록 맞춤화할 수 있습니다.`,
            run_summary_template: '',
            reminder_timer_default_seconds: 7 * 24 * 60 * 60, // 주 1회
            retrospective_template:
                mtrim`### 잘된 점은 무엇이었나요?
                -

                ### 더 잘할 수 있었던 점은?
                -

                ### 다음에는 무엇을 바꿔야 할까요?
                - `,
            retrospective_reminder_interval_seconds: 0, // Once
        },
    },
    {
        title: 'FEATURE.LIFECYCLE.TITLE',
        description: 'FEATURE.LIFECYCLE.DESCRIPTION',
        icon: <FeatureLifecycle/>,
        color: '#62697E14',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'FEATURE.LIFECYCLE.TITLE',
            description: 'FEATURE.LIFECYCLE.DESCRIPTION',
            checklists: [
                {
                    title: '기획',
                    items: [
                        newChecklistItem('문제가 무엇이고 왜 중요한지 설명하기'),
                        newChecklistItem('잠재적 해결책에 대한 제안 설명하기'),
                        newChecklistItem('열린 질문과 가정 사항 나열하기'),
                        newChecklistItem('목표 출시일 설정하기'),
                    ],
                },
                {
                    title: '킥오프',
                    items: [
                        newChecklistItem(
                            '기능의 엔지니어링 오너 선정',
                            mtrim`오너의 기대 역할:
                            - 목표 날짜에 대한 기대를 설정하고 달성할 책임
                            - 주간 상태 업데이트 게시
                            - R&D 미팅에서 기능 데모
                            - 출시 후 기술 품질 보장`,
                        ),
                        newChecklistItem('기능 채널에 기여자 식별 및 초대'),
                        newChecklistItem(
                            '킥오프 및 정기 체크인 미팅 일정 잡기',
                            mtrim`킥오프 미팅 종료 시 기대 사항:
                            - 구체적인 문제, 대략적인 범위 및 목표에 대한 정렬
                            - 각 개인별로 명확한 다음 단계와 산출물`,
                        ),
                    ],
                },
                {
                    title: '개발',
                    items: [
                        newChecklistItem(
                            '범위, 품질, 일정에 대한 정렬',
                            '여기에는 정렬을 달성하기 위한 다양한 노력이 있을 수 있으며, 이 체크박스는 기여자들의 승인 완료를 상징합니다.',
                        ),
                        newChecklistItem('기능 마일스톤을 세분화하여 이 체크리스트에 추가'),
                    ],
                },
                {
                    title: '출시',
                    items: [
                        newChecklistItem('문서 및 사용자 가이드 업데이트'),
                        newChecklistItem('모든 기능 및 버그 PR을 master에 병합'),
                        newChecklistItem(
                            '커뮤니티에 데모 진행',
                            mtrim`예시:
                            - R&D 미팅
                            - 개발자 미팅
                            - 전사 미팅`
                        ),
                        newChecklistItem('도입률 측정을 위한 텔레메트리 대시보드 구축'),
                        newChecklistItem(
                            'Go-to-market 팀을 위한 런치 키트 제작',
                            mtrim`포함되지만 이에 국한되지 않음:
                            - 출시 블로그 포스트
                            - 원페이지 자료
                            - 데모 영상`,
                        ),
                    ],
                },
                {
                    title: '후속 조치',
                    items: [
                        newChecklistItem('도입 지표 및 사용자 피드백 검토 미팅 일정 잡기'),
                        newChecklistItem('개선 사항 및 다음 반복 계획'),
                    ],
                },
            ],
            create_public_playbook_run: true,
            channel_name_template: '기능: <name>',
            message_on_join_enabled: true,
            message_on_join:
                mtrim`안녕하세요, 환영합니다!

                이 채널은 **Feature Lifecycle** 플레이북의 일부로 생성되었으며, 이 기능 개발과 관련된 대화가 이루어집니다. 이 메시지는 마크다운으로 자유롭게 수정할 수 있으며, 새로운 채널 멤버가 유용한 맥락과 리소스를 안내받을 수 있도록 맞춤화할 수 있습니다.`,
            run_summary_template_enabled: true,
            run_summary_template:
                mtrim`**한 줄 요약**
                <예: 모든 실행에서 일관된 설명 템플릿을 지정할 수 있도록 하여 읽기 쉽게 만듭니다.>

                **목표 출시**
                - 코드 완료: 날짜
                - 고객 출시: 월

                **참고 자료**
                - Jira Epic: <링크>
                - UX 프로토타입: <링크>
                - 기술 설계: <링크>
                - 사용자 문서: <링크>`,
            reminder_message_template:
                mtrim`### 데모
                <Insert_GIF_here>

                ### 지난주 이후 변경 사항
                -

                ### 위험 요소
                - `,
            reminder_timer_default_seconds: 24 * 60 * 60, // 1일
            retrospective_template:
                mtrim`### 시작할 것
                -

                ### 중단할 것
                -

                ### 유지할 것
                - `,
            retrospective_reminder_interval_seconds: 0, // Once
        },
    },
    {
        title: 'BUG.BASH.TITLE',
        description: 'BUG.BASH.DESCRIPTION',
        icon: <BugBash/>,
        color: '#7A560014',
        author: <MattermostLogo/>,
        template: {
            ...emptyPlaybook(),
            title: 'BUG.BASH.TITLE',
            description: mtrim`Mattermost Playbooks 팀은 한 달에 한두 번 정도 이 플레이북을 사용하여 최신 Playbooks 버전을 테스트하는 50분간의 버그 배시(Bug Bash)를 진행합니다.

            이 플레이북을 귀하의 버그 배시 프로세스에 맞게 자유롭게 커스터마이즈하세요.`,
            create_public_playbook_run: true,
            channel_name_template: 'Bug Bash (vX.Y)',
            checklists: [
                {
                    title: '테스트 환경 설정 (미팅 전)',
                    items: [
                        newChecklistItem(
                            '테스트할 빌드를 community-daily에 배포',
                        ),
                        newChecklistItem(
                            'T0 클라우드 인스턴스 생성',
                            '',
                            '/cloud create playbooks-bug-bash-t0 --license te --image mattermost/mattermost-team-edition --test-data --version master',
                        ),
                        newChecklistItem(
                            'E0 클라우드 인스턴스 생성',
                            '',
                            '/cloud create playbooks-bug-bash-e0 --license te --test-data --version master',
                        ),
                        newChecklistItem(
                            'E10 클라우드 인스턴스 생성',
                            '',
                            '/cloud create playbooks-bug-bash-e10 --license e10 --test-data --version master',
                        ),
                        newChecklistItem(
                            'E20 클라우드 인스턴스 생성',
                            '',
                            '/cloud create playbooks-bug-bash-e20 --license e20 --test-data --version master',
                        ),
                        newChecklistItem(
                            '모든 클라우드 인스턴스에 Open Server & CRT 활성화',
                            mtrim`명령줄에서 각 서버에 [\`mmctl\`](https://github.com/mattermost/mmctl)로 로그인한 후 다음과 같이 설정하세요:
                                \`\`\`
                                for server in playbooks-bug-bash-t0 playbooks-bug-bash-e0 playbooks-bug-bash-e10 playbooks-bug-bash-e20; do
                                    mmctl auth login https://$server.test.mattermost.cloud --name $server --username sysadmin --password-file <(echo "Sys@dmin123");
                                    mmctl config set TeamSettings.EnableOpenServer true;
                                    mmctl config set ServiceSettings.CollapsedThreads default_on;
                                done
                                \`\`\``,
                        ),
                        newChecklistItem(
                            '각 인스턴스에 플러그인 설치',
                            mtrim`명령줄에서 각 서버에 [\`mmctl\`](https://github.com/mattermost/mmctl)로 로그인한 후 다음과 같이 플러그인을 설치하세요:
                                \`\`\`
                                for server in playbooks-bug-bash-t0 playbooks-bug-bash-e0 playbooks-bug-bash-e10 playbooks-bug-bash-e20; do
                                    mmctl auth login https://$server.test.mattermost.cloud --name $server --username sysadmin --password-file <(echo "Sys@dmin123");
                                    mmctl plugin install-url --force https://github.com/mattermost/mattermost-plugin-playbooks/releases/download/v1.22.0%2Balpha.3/playbooks-1.22.0+alpha.3.tar.gz
                                done
                                \`\`\``,
                        ),
                        newChecklistItem(
                            '버그 배시 공지',
                            '팀과 커뮤니티에 다가오는 버그 배시 일정을 반드시 공지하세요.',
                        ),
                    ],
                },
                {
                    title: '범위 정의 (10분)',
                    items: [
                        newChecklistItem(
                            'GitHub 커밋 diff 검토',
                        ),
                        newChecklistItem(
                            '테스트 대상 영역 체크리스트에 추가할 신규 기능 식별',
                        ),
                        newChecklistItem(
                            '테스트 대상 영역 체크리스트에 추가할 기존 기능 식별',
                        ),
                        newChecklistItem(
                            '관련 T0/E0/E10/E20 조합 추가',
                        ),
                        newChecklistItem(
                            '담당자 지정',
                        ),
                    ],
                },
                {
                    title: '테스트 대상 영역 (30분)',
                    items: [],
                },
                {
                    title: '트리아지 (10분)',
                    items: [
                        newChecklistItem(
                            '다음 릴리스를 위해 수정할 이슈 검토',
                        ),
                        newChecklistItem(
                            '필요한 버그 수정 담당자 지정',
                        ),
                    ],
                },
                {
                    title: '정리',
                    items: [
                        newChecklistItem(
                            'T0 클라우드 인스턴스 정리',
                            '',
                            '/cloud delete playbooks-bug-bash-t0',
                        ),
                        newChecklistItem(
                            'E0 클라우드 인스턴스 정리',
                            '',
                            '/cloud delete playbooks-bug-bash-e0',
                        ),
                        newChecklistItem(
                            'E10 클라우드 인스턴스 정리',
                            '',
                            '/cloud delete playbooks-bug-bash-e10',
                        ),
                        newChecklistItem(
                            'E20 클라우드 인스턴스 정리',
                            '',
                            '/cloud delete playbooks-bug-bash-e20',
                        ),
                    ],
                },
            ],
            status_update_enabled: true,
            message_on_join: mtrim`환영합니다! 이 채널은 Playbooks의 새로운 버전을 테스트하는 50분간의 버그 배시를 위해 사용됩니다. 처음 10분은 범위와 담당자를 정하고, 다음 30분은 정의된 영역에서 집중 테스트, 마지막 10분은 트리아지 시간입니다.

            이슈를 발견하면 #bug 태그를 달아 새로운 스레드로 올리고, 스크린샷과 재현 방법을 공유해 주세요. 버그 배시의 오너가 필요에 따라 티켓으로 분류할 예정입니다.`,
            message_on_join_enabled: true,
            retrospective_enabled: false,
            run_summary_template_enabled: true,
            run_summary_template: mtrim`Playbooks 팀은 다음 출시 버전을 검증하기 위해 버그 배시를 진행합니다.

            이슈가 발견되면 새로운 스레드를 시작하고 #bug(또는 #feature) 태그를 달아 추적이 쉽도록 해주세요.

            **릴리즈 링크**: TBD
            **Zoom**: TBD
            **트리아지 필터**: https://mattermost.atlassian.net/secure/RapidBoard.jspa?rapidView=68&projectKey=MM&view=planning.nodetail&quickFilter=332&issueLimit=100

            | 서버 |
            | -- |
            | [T0](https://playbooks-bug-bash-t0.test.mattermost.cloud) |
            | [E0](https://playbooks-bug-bash-e0.test.mattermost.cloud) |
            | [E10](https://playbooks-bug-bash-e10.test.mattermost.cloud) |
            | [E20](https://playbooks-bug-bash-e20.test.mattermost.cloud) |

            로그인 정보:

            | 아이디 | 비밀번호 |
            | -- | -- |
            | sysadmin | Sys@dmin123 |`,
        },
    },
    {
        title: 'LEARN.PLAYBOOKS.TITLE',
        label: 'Recommended For Beginners',
        labelColor: '#E5AA1F29-#A37200',
        icon: <LearnPlaybooks/>,
        color: '#FFBC1F14',
        author: <MattermostLogo/>,
        description: 'LEARN.PLAYBOOKS.DESCRIPTION',
        template: {
            ...emptyPlaybook(),
            title: 'LEARN.PLAYBOOKS.TITLE',
            description: 'LEARN.PLAYBOOKS.DESCRIPTION',
            create_public_playbook_run: true,
            channel_name_template: '온보딩 실행',
            checklists: [
                {
                    title: '학습',
                    items: [
                        newChecklistItem('이 페이지 상단에서 실행 이름이나 설명을 편집해 보세요.'),
                        newChecklistItem('첫 번째와 두 번째 작업을 체크해 보세요!'),
                        newChecklistItem('작업을 자신이나 다른 멤버에게 할당해 보세요.'),
                        newChecklistItem('첫 번째 상태 업데이트를 게시해 보세요.'),
                        newChecklistItem('첫 번째 체크리스트를 완료해 보세요!'),
                    ],
                },
                {
                    title: '협업',
                    items: [
                        newChecklistItem('함께 협업하고 싶은 팀원을 초대해 보세요.'),
                        newChecklistItem('작업을 건너뛰어 보세요.'),
                        newChecklistItem('실행을 완료해 보세요.'),
                    ],
                },
            ],
            status_update_enabled: true,
            reminder_timer_default_seconds: 50 * 60, // 50 minutes
            message_on_join: '',
            message_on_join_enabled: false,
            retrospective_enabled: false,
            run_summary_template_enabled: true,
            run_summary_template: mtrim`이 요약 영역은 모든 참여자가 한눈에 맥락을 파악할 수 있도록 도와줍니다. 채널 메시지처럼 마크다운 문법을 지원하니, 클릭해서 직접 편집해 보세요!

            - 시작일: 2021년 12월 20일
            - 목표일: 추후 결정
            - 사용자 가이드: Playbooks 문서`,
        },
    },
]);

export default PresetTemplates;
