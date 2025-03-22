export const ErrorHandler = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
