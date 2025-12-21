import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            "welcome": "Welcome to Pong"
        }
    },
    fr: {
        translation: {
            "welcome": "Bienvenue à Pong"
        }
    },
    es: {
        translation: {
            "welcome": "Bienvenido a Pong"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
