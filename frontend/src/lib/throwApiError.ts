export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

export const throwApiError = async (response: Response): Promise<never> => {
    let message = "Đã xảy ra lỗi không xác định";
    let code: string | undefined;

    try {
        const errorBody = await response.json();
        message = errorBody.message ?? message;
        code = errorBody.code;
    } catch {
        // response không có body
    }

    throw new ApiError(response.status, message, code);
};
