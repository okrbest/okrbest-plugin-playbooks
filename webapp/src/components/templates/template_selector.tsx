// Copyright (c) 2020-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {I18nextProvider, useTranslation} from 'react-i18next';

import i18n from 'src/i18next-config';

import {savePlaybook} from 'src/client';
import {StyledSelect} from 'src/components/backstage/styles';
import {setPlaybookDefaults} from 'src/types/playbook';
import {usePlaybooksRouting} from 'src/hooks';

import {useLHSRefresh} from 'src/components/backstage/lhs_navigation';

import TemplateItem from './template_item';
import PresetTemplates, {PresetTemplate} from './template_data';

const presetTemplateOptionsWithTranslation = (t: (s: string) => string) =>
    PresetTemplates.map((template: PresetTemplate) => ({label: t(template.title), value: template.title}));

interface Props {
    templates?: PresetTemplate[];
}

interface TemplateDropdownProps {
    template?: string
    onTemplateSet: (template?: string) => void
}

export const TemplateDropdown = (props: TemplateDropdownProps) => {
    const {formatMessage} = useIntl();
    const {t} = useTranslation();

    const handleTemplateSet = (option: {value: string}) => {
        props.onTemplateSet(option.value);
    };

    const options = presetTemplateOptionsWithTranslation(t);

    return (
        <StyledSelect
            filterOption={null}
            isMulti={false}
            placeholder={formatMessage({defaultMessage: 'Select a template'})}
            onChange={handleTemplateSet}
            options={options}
            value={options.find((val) => val.value === props?.template)}
            isClearable={false}
            maxMenuHeight={380}
        />
    );
};

const SelectorGrid = styled.div`
	display: grid;
    padding: 0 0 100px;
    gap: 2.5rem;
	grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    place-items: flex-start center;
`;

const instantCreatePlaybook = async (template: PresetTemplate, teamID: string, username: string, t: (s: string) => string): Promise<string> => {
    const pb = setPlaybookDefaults(template.template, t);
    pb.public = true;
    pb.team_id = teamID;

    // 번역된 title과 description을 DB에 저장
    pb.title = t(template.title);
    pb.description = template.description ? t(template.description) : '';

    if (username !== '') {
        pb.title = '@' + username + "'s " + t(template.title);
    }
    const data = await savePlaybook(pb);

    return data?.id;
};

const TemplateSelector = ({templates}: Props) => {
    const teamId = useSelector(getCurrentTeamId);
    const currentUser = useSelector(getCurrentUser);
    const {edit} = usePlaybooksRouting();
    const refreshLHS = useLHSRefresh();
    const {t} = useTranslation();

    // templates prop이 있으면 그걸, 없으면 PresetTemplates 사용
    const displayTemplates = templates ?? PresetTemplates;

    return (
        <I18nextProvider i18n={i18n}>
            <SelectorGrid>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {displayTemplates.map((template: PresetTemplate, idx: number) => {
                    // @ts-ignore - key is a valid React prop for list items
                    return (
                        <TemplateItem
                            key={`${template.title}-${idx}`}
                            label={template.label}
                            title={template.title}
                            description={template.description ?? ''}
                            color={template.color}
                            icon={template.icon}
                            author={template.author}
                            labelColor={template.labelColor}
                            onSelect={async () => {
                                let username = currentUser.username;
                                const isTutorial = template.title === 'LEARN.PLAYBOOKS.TITLE';
                                if (isTutorial) {
                                    username = '';
                                }
                                const playbookID = await instantCreatePlaybook(template, teamId, username, t);
                                refreshLHS();
                                edit(playbookID);
                            }}
                        />
                    );
                })}
            </SelectorGrid>
        </I18nextProvider>
    );
};

export default TemplateSelector;
