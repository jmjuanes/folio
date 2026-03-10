export enum ENDPOINTS {
    STATUS = "/_ai/status",
    QUOTAS = "/_ai/quotas",
    GENERATE_ELEMENTS = "/_ai/generateElements",
    TRANSFORM_ELEMENTS = "/_ai/transformElements",
};

export enum API_ERROR_MESSAGES {
    ERROR_PERFORMING_REQUEST = "Error performing the request. Contact the administrator",
    EMPTY_PROMPT = "Prompt is empty",
    DAILY_REQUESTS_LIMIT_REACHED = "Daily requests limit reached. Please try again tomorrow",
    NOT_FOUND = "Not found",
};
