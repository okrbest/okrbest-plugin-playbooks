// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';
import {getFullName} from 'mattermost-redux/utils/user_utils';

/**
 * 커스텀 displayUsername 함수 - 원하는 로직으로 수정 가능
 * 기존 mattermost-redux의 displayUsername 함수를 커스터마이징한 버전
 */
export const displayUsername = (user: UserProfile | null | undefined, teammateNameDisplay: string, useFallbackUsername = true): string => {
    let name = useFallbackUsername ? 'Someone' : '';

    if (user) {
        if (teammateNameDisplay === 'nickname_full_name') {
            name = user.nickname || getFullName(user);
        } else if (teammateNameDisplay === 'full_name') {
            name = getFullName(user);
        } else if (teammateNameDisplay === 'username') {
            const fullName = getFullName(user);
            const nickname = user.nickname ? `(${user.nickname})` : '';

            if (fullName && nickname) {
                // 성명과 닉네임 모두 있는 경우: "admin - 홍길동 김 (관리자)"
                name = `${user.username} - ${fullName} ${nickname}`;
            } else if (fullName) {
                // 성명만 있는 경우: "admin - 홍길동 김"
                name = `${user.username} - ${fullName}`;
            } else if (nickname) {
                // 닉네임만 있는 경우: "admin (관리자)"
                name = `${user.username} ${nickname}`;
            } else {
                // 둘 다 없는 경우: "admin"
                name = user.username;
            }
        } else {
            name = user.username;
        }

        // 이름이 비어있으면 username으로 fallback
        if (!name || name.trim().length === 0) {
            name = user.username;
        }
    }

    return name;
};
