// エラー生成
export class CustomError extends Error {
    private _statusCode: number;
    private _resMessage: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this._statusCode = statusCode;
        this.name = this.constructor.name;

        switch(this._statusCode) {
            case 400:
                this._resMessage = 'Bad Request';
                break
            case 403:
                this._resMessage = 'Forbidden';
                break
            case 404:
                this._resMessage = 'Not Found';
                break
            case 408:
                this._resMessage = 'Request Timeout';
                break
            case 503:
                this._resMessage = 'Service Unavailable';
                break
            default:
                this._resMessage = 'Internal Server Error';
        }
    }

    get statusCode() {
        return this._statusCode;
    }

    get resMessage() {
        return this._resMessage;
    }
}