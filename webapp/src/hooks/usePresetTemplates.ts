import {useTranslation} from 'react-i18next';
import {PresetTemplates} from '../components/templates/template_data';

export const usePresetTemplates = () => {
    const {t} = useTranslation();

    // 템플릿 데이터를 번역된 제목과 설명으로 변환
    const translatedTemplates = PresetTemplates.map(template => ({
        ...template,
        title: t(template.title),
        description: template.description ? t(template.description) : '',
    }));

    return translatedTemplates;
}; 