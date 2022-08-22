import defaultLanguage from "../locales/en.json";

const getInObject = (obj, path) => {
    return path.split(".").reduce((o, k) => o?.[k] || "", obj);
};

export const useTranslation = () => {
    //TODO: allow to change the default language
    return {
        t: path => getInObject(defaultLanguage, path) || path,
    };
};
