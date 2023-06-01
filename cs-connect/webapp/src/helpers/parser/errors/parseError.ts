class ParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParseError';
    }
}

export default ParseError;