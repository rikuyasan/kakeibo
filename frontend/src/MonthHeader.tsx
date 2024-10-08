import { useState, useEffect } from 'react';
import { addMonths, format, subMonths } from 'date-fns';
import "./App.css";

interface MonthHeaderProps {
    date: Date;
    setDate: React.Dispatch<React.SetStateAction<Date>>;
}

function MonthHeader({date, setDate}: MonthHeaderProps) {

    // 2024年4月以前を選択できないようにする
    const [previousLimit, setPreviousLimit] = useState(false);
    const [nextLimit, setNextLimit] = useState(false);
    useEffect(() => {
        const minMonth = '202403';
        const maxmonth = format(new Date(), 'yyyyMM');
        const currentMonth = format(date , 'yyyyMM');
        if (currentMonth <= minMonth) {
            setPreviousLimit(true);
            return;
        }
        setPreviousLimit(false);

        if (maxmonth <= currentMonth) {
            setNextLimit(true);
            return;
        }
        setNextLimit(false);
    }, [date]);

    // 日付を1ヶ月前に変更する
    const handlePreviousMonth = () => {
        const newDate = subMonths(date ,1);
        setDate(newDate);
    };

    // 日付を1ヶ月後に変更する
    const handleNextMonth = () => {
        const newDate = addMonths(date ,1);
        setDate(newDate);
    };

    // 日付を今日に変更する
    const handleToday = () => {
        setDate(new Date());
    };

    return (
        <header>
            <h1 className='nowmonth'>{format(date, 'yyyy年MM月')}</h1>
            <div className="monthheader">
                <button onClick={handlePreviousMonth} disabled={previousLimit} className='transfer-month'>&lt;</button>
                <button onClick={handleToday} className='transfer-month'>今月に戻る</button>
                <button onClick={handleNextMonth} disabled={nextLimit} className='transfer-month'>&gt;</button>
            </div>
        </header>
    )
}

export default MonthHeader;