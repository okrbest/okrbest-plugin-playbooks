import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../i18n/en.json';
import ko from '../i18n/ko.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {translation: en},
            ko: {translation: ko},
        },
        lng: 'ko', // 기본 언어
        fallbackLng: 'ko',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

export default i18n; 