import { useState } from 'react';
import { EventInput } from "@fullcalendar/core";
import "./App.css";
import TagModal from './TagModal';
import CashEditModal from './CashEditModal';

interface CardData {
    category: string;
    day: string;
    id: number;
    name: string;
    payment: number;
}

interface CalendarProps {
    onDateClick: () => void;
    detail: EventInput[] | null; // detailがnullの可能性も考慮
    setData: React.Dispatch<React.SetStateAction<CardData[]>>;
    data: CardData[];
    date: Date;
    onUpdateTag: (event: EventInput[] | null) => void;
    onReload: (clickedDate: string) => Promise<void>;
    detailDate: string;
}

interface ColorPalette {
    '#2E86C1': string;  // Vibrant Blue
    '#28B463': string;  // Emerald Green
    '#F39C12': string;  // Orange Gold
    '#8E44AD': string;  // Deep Purple
    '#E74C3C': string;  // Bright Red
    '#1ABC9C': string;  // Turquoise
    '#D35400': string;  // Burnt Orange
    '#5D6D7E': string;  // Cool Gray
}

function CalendarDetail({ onDateClick, detail, setData, data, date, onUpdateTag, onReload, detailDate }: CalendarProps) {
    // detailがnullまたは配列でない場合、空の配列を使用する
    const eventDetails = Array.isArray(detail) ? detail : [];

    const colorPalette: ColorPalette = {
        '#2E86C1': '旅行',
        '#28B463': '経費',
        '#F39C12': '交通費',
        '#8E44AD': '生活必需品',
        '#E74C3C': 'サブスク',
        '#1ABC9C': '外出',
        '#D35400': '娯楽',
        '#5D6D7E': 'その他'
    };

    const [modal, setModal] = useState(false);
    const [cashModal, setCashModal] = useState(false);
    const [dataId, setDataId] = useState<string>('0');
    const [dataMonth, setDataMonth] = useState<string>('202409');
    const [payMethod, setPayMethod] = useState<string>("rakuten");
    const [cashData, setCashData] = useState<EventInput>({});

    const handleTagModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const parentData = (e.currentTarget.parentElement as HTMLElement)
        setDataId(parentData.id)
        const onlyYearMonth: string[] | undefined = parentData.dataset.date?.replace("-", "").split("-");
        const paymethod: string = parentData.dataset.method || payMethod;
        setDataMonth(onlyYearMonth![0])
        setModal(true);
        setPayMethod(paymethod);
    }

    const handleCashModal = (list: EventInput) => {
        console.log("ボタンが押されました")
        setCashModal(true);
        setCashData(list);
    };

    const handleDeleteCash = async (list: EventInput) => {
        console.log('削除します');
        const [nowYear, nowMonth] = (list.start as string).split('-');
        const now = `${nowYear}${nowMonth}`;
        const deleteCashData = async () => {
            try {
                await fetch(`http://127.0.0.1:3001/cash/delete?currentMonth=${now}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: +(list.id as string) }),
                });
                onReload(list.start as string);
            } catch (error) {
                console.error('リクエストエラー:', error);
                return [];
            }
        };
        await deleteCashData();
    }

    const [detailYear, detailMonth, detailDay] = detailDate.split('-');

    const detailDateChange = `${detailYear}年${detailMonth}月${detailDay}日`

    return (
        <div className="calendar-container">
            <h2 style={{fontSize: '35px', fontWeight: 'bold'}}>{detailDateChange}</h2>
            {eventDetails.length > 0 ? (
                eventDetails.map((list, index) => (
                    <div className="event-detail" key={index} id={list.id} data-date={list.start ? list.start.toString() : "2024-09-28"} data-method={list.extendedProps?.payMethod} style={{ backgroundColor: list.backgroundColor || "#5D6D7E" }}>
                        <h3 style={{fontSize: '20px', fontWeight: 'bolder'}}>タグ: {list.backgroundColor && colorPalette[list.backgroundColor as keyof ColorPalette] ? colorPalette[list.backgroundColor as keyof ColorPalette] : "タグなし"}</h3>
                        <p style={{fontSize:"large", fontWeight: "bold"}}>
                            料金: {list.title}, 利用店舗: {list.description}, 支払い方法: {list.extendedProps?.payMethod}
                        </p>
                        {1000 <= +(list.id as string) ? (
                            <>
                                <button onClick={() => handleCashModal(list)} className='edit-button'>データ編集</button>
                                <button onClick={() => handleDeleteCash(list)} className='edit-button'>削除</button>
                            </>
                        ) : (
                            <button onClick={handleTagModal} className='edit-button'>タグ編集</button>
                        )}
                    </div>
                ))
            ) : (
                <p style={{fontWeight: "bold",fontSize: "x-large", textAlign: "center"}}>使用履歴がありません</p> // イベントがない場合の表示
            )}

            {modal && <TagModal modal={modal} setModal={setModal} id={dataId} month={dataMonth} payMethod={payMethod} setData={setData} data={data} date={date} onUpdateTag={onUpdateTag} event={eventDetails} />}
            {cashModal && <CashEditModal modal={cashModal} setModal={setCashModal} listData={cashData} onReload={onReload} />}
            <button onClick={onDateClick} className='detail-button'>戻る</button>
        </div>
    );

}

export default CalendarDetail;
