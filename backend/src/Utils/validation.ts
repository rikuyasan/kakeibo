import { categoryList, paymentMethodList } from "../const";
import { CustomError } from "../Errors/CustomError";

export interface Field {
    date: string
    name: string
    payment: number
    category: string
    paymentMethod: string
    yearMonth: number
};

export interface PrimaryKey {
    id: number
}

// パラメータの型ガード関数
export function isFullField(body: any): body is Field {
    if (typeof body !== 'object' && body !== null) {
        throw new CustomError('the body is incorrect', 400);
    }
    if (typeof body.date !== 'string') {
        throw new CustomError("the 'date' parameter must be string", 400);
    }
    if (typeof body.name !== 'string') {
        throw new CustomError("the 'name' parameter must be string", 400);
    }
    if (!(Number.isInteger(body.payment))) {
        throw new CustomError("the 'payment' parameter must be integer", 400);
    }
    if (typeof body.category !== 'string') {
        throw new CustomError("the 'category' parameter must be string", 400);
    }
    if (typeof body.paymentMethod !== 'string') {
        throw new CustomError("the 'paymentMethod' parameter must be string", 400);
    }
    if (!(Number.isInteger(body.yearMonth))) {
        throw new CustomError("the 'yearMonth' parameter must be integer", 400);
    }
    return true
};

// パラメータidのバリデーション
export function isPrimaryKey(body: any) {
    if (!(Number.isInteger(body.id))) {
        throw new CustomError("the 'id' parameter must be integer", 400);
    }
    if (body.id < 1) {
        throw new CustomError("the 'id' parameter must be a positive number", 400);
    }
}

// パラメータdateのバリデーション
export function dateValidation(date: string, yearMonth: number): void {
    // 日付の形式を確認する正規表現
    const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    if (!datePattern.test(date)) {
        throw new CustomError("The 'date' parameter is in an invalid format", 400);
    }

    // 入力された日付を分割
    const [yearStr, monthStr, dayStr] = date.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    // yearMonthの検証
    if (year * 100 + month !== yearMonth) {
        throw new CustomError("The 'date' and 'yearMonth' must correspond to the same year and month.", 400);
    }

    // Dateオブジェクトを生成
    const dateObj = new Date(year, month - 1, day);

    const validYear = dateObj.getFullYear();
    const validMonth = dateObj.getMonth() + 1; // 月は0始まりのため+1
    const validDay = dateObj.getDate();

    // 入力値とDateオブジェクトの値を比較
    if (year !== validYear || month !== validMonth || day !== validDay) {
        throw new CustomError("The 'date' parameter is an invalid date", 400);
    }
}


// パラメータnameのバリデーション
export function nameValidation(name: string): void {
    if (name.length > 100) {
        console.log(`動作しました: ${name}`)
        throw new CustomError("the 'name' parameter in 100 words or less" , 400);
    }
}

// パラメータpaymentのバリデーション
export function paymentValidation(payment: number): void {
    if (payment > 10**6 || payment < 1) {
        throw new CustomError("the 'payment' range is 1~1,000,000", 400);
    }
}

// パラメータcategoryのバリデーション
export function categoryValidation(category: string): void {
    if (!(categoryList.includes(category))) {
        throw new CustomError("the 'category' parameter is incorrect" , 400);
    }
}

// パラメータpaymentMethodのバリデーション
export function paymentMethodValidation(paymentMethod: string): void {
    if (!(paymentMethodList.includes(paymentMethod))) {
        throw new CustomError("the 'paymentMethod' parameter is incorrect" , 400);
    }
}

// パラメータyearMonthのバリデーション
export function yearMonthValidation(yearMonth: number): void {
    const year = Math.floor(yearMonth / 100);
    const month = yearMonth % 100;
    if (year < 2024 || year > 2099 || month < 1 || month > 12) {
        throw new CustomError("the 'yearMonth' parameter is incorrect", 400);
    }
}