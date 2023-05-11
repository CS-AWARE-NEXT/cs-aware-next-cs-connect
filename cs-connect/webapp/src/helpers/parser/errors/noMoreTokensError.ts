class NoMoreTokensError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoMoreTokensError';
    }
}

export default NoMoreTokensError;