import { useState, useLayoutEffect, useMemo } from "react";
import { useForm } from 'react-hook-form';
import Modal from "react-modal";
import { EventInput } from "@fullcalendar/core";
import { format } from "date-fns";

interface CashForm {
    date: string;
    description: string;
    payment: string;
    category: string;
    id: number;
    oldMonth: string;
}

interface EditrModal {
    modal: boolean;
    setModal: React.Dispatch<React.SetStateAction<boolean>>;
    listData: EventInput;
    onReload: (clickedDate: string) => Promise<void>;
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

function CashEditModal({ modal, setModal, listData, onReload }: EditrModal) {
    const colorArray: string[] = ['#2E86C1', '#28B463', '#F39C12', '#8E44AD', '#E74C3C', '#1ABC9C', '#D35400', '#5D6D7E'];
    const colorPalette: ColorPalette = useMemo(() => ({
        '#2E86C1': '旅行',
        '#28B463': '経費',
        '#F39C12': '交通費',
        '#8E44AD': '生活必需品',
        '#E74C3C': 'サブスク',
        '#1ABC9C': '外出',
        '#D35400': '娯楽',
        '#5D6D7E': 'その他'
    }), []);
    const [selectCategory, setSelectCategory] = useState<string>(colorPalette[listData.backgroundColor as keyof ColorPalette]);

    // 初回レンダリングのみ実行
    useLayoutEffect(() => {
        setSelectCategory(colorPalette[listData.backgroundColor as keyof ColorPalette]);
        console.log(selectCategory);
    }, [colorPalette, listData.backgroundColor, selectCategory]);

    const defaultValues = {
        date: listData.start as string,
        description: listData.description,
        payment: listData.title?.slice(0, -1) as string
    }

    const customStyles = {
        content: {
            zIndex: 1000,
            position: 'relative' as 'relative',
            padding: '20px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center' as 'center',
        },
        overlay: {
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }
    };

    const handleReturnClick = () => {
        reset();
        setModal(false);
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting, isSubmitted }
    } = useForm<CashForm>({
        mode: "onSubmit",
        defaultValues
    });

    const dateRequired = register("date", {
        required: "日付を入力して下さい",
        validate: {
            rangeDate: (value) => {
                const todayDate = format(new Date(), "yyyy-MM-dd");
                const minDate = "2024-03-01";
                if (todayDate < value) {
                    return "入力できるのは今日までのデータです";
                } else if (value < minDate) {
                    return "古すぎるデータは入力できません";
                } else {
                    return true;
                }
            },
        }
    });

    const descriptionRequired = register("description", {
        required: "利用店舗、概要等を入力して下さい",
        maxLength: {
            value: 50,
            message: "文字数オーバーです"
        }
    });

    const paymentRequired = register("payment", {
        required: "価格を入力して下さい",
        min: {
            value: 1,
            message: "無効な数値です"
        }
    })

    const onSubmit = (data: CashForm) => {
        const [oldYear, oldMonth] = (listData.start as string).split('-');
        const formData = {
            date: data.date.replace(/-/g, '/'),
            description: data.description,
            payment: +data.payment,
            category: selectCategory,
            id: +(listData.id as string),
            oldMonth: `${oldYear}${oldMonth}`
        };
        const [year, thisMonth] = data.date.split('-');
        const month = `${year}${thisMonth}`;
        console.log(formData);
        console.log(month);
        reset();
        setModal(false);
        const postEditTag = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_CASH}/edit?currentMonth=${month}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                console.log(response.status)
                if (!response.ok) {
                    throw new Error('リクエストが失敗しました');
                }
                console.log('リクエスト成功');
                await onReload(data.date);
                setModal(false);
            } catch (error) {
                console.error('リクエストエラー:', error);
            };
        }
        postEditTag();
    };

    const handleTagModal = (color: string) => {
        setSelectCategory(colorPalette[color as keyof ColorPalette]);
    };

    return (
        <Modal isOpen={modal} style={customStyles}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <button onClick={handleReturnClick} type="button" className="batsu">x</button>
                <div className="input-format">
                    <label
                        htmlFor="date"
                        style={{
                            color: isSubmitted && errors.date ? 'red' : '',
                        }}
                    >
                        支払日：
                    </label>
                    <input
                        type="date"
                        id="date"
                        max="9999-12-31"
                        defaultValue={defaultValues.date}
                        {...dateRequired}
                        style={{
                            borderColor: isSubmitted && errors.date ? 'red' : '',
                            color: 'black',
                        }}
                    />
                    {isSubmitted && <div style={{ color: 'red' }}>{errors.date?.message}</div>}
                </div>
                <div className="input-format">
                    <label
                        htmlFor="description"
                        style={{
                            color: isSubmitted && errors.description ? 'red' : '',
                        }}
                    >
                        概要：
                    </label>
                    <input
                        type="text"
                        placeholder="例：大学の昼飯代"
                        id="description"
                        defaultValue={defaultValues.description}
                        {...descriptionRequired}
                        style={{
                            borderColor: isSubmitted && errors.description ? 'red' : '',
                            color: 'black',
                        }}
                    />
                    {isSubmitted && <div style={{ color: 'red' }}>{errors.description?.message}</div>}
                </div>
                <div className="input-format">
                    <label
                        htmlFor="payment"
                        style={{
                            color: isSubmitted && errors.payment ? 'red' : '',
                        }}
                    >
                        価格(円)：
                    </label>
                    <input
                        type="number"
                        id="payment"
                        defaultValue={defaultValues.payment}
                        {...paymentRequired}
                        style={{
                            borderColor: isSubmitted && errors.payment ? 'red' : '',
                            color: 'black',
                        }}
                    />
                    {isSubmitted && <div style={{ color: 'red' }}>{errors.payment?.message}</div>}
                </div>
                <label>カテゴリー</label>
                <div className="category-grid">
                    {colorArray.map((color) => (
                        <button
                            key={color}
                            onClick={() => handleTagModal(color)}
                            type="button"
                            style={{
                                backgroundColor: (colorPalette[color as keyof ColorPalette] === selectCategory ? darkenColor(color) : color),
                                color: 'white',
                                border: (colorPalette[color as keyof ColorPalette] === selectCategory ? 'solid 4px #EFA6AA' : 'solid 4px white'),
                                borderRadius: '8px',
                                padding: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'background-color 0.3s ease',
                                fontWeight: 'bold',
                            }}
                            className="category_button"
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = darkenColor(color))}
                            onMouseOut={(e) => (colorPalette[color as keyof ColorPalette] === selectCategory ? e.currentTarget.style.backgroundColor = darkenColor(color) : e.currentTarget.style.backgroundColor = color)}
                        >
                            {colorPalette[color as keyof ColorPalette]}
                        </button>
                    ))}
                </div>
                <button
                    id="submit"
                    type="submit"
                    disabled={isSubmitted && (!isValid || isSubmitting)}  // 初回送信後のみバリデーションに基づいて無効化
                >
                    登録
                </button>
            </form>
        </Modal>
    );
}

export default CashEditModal;

function darkenColor(color: string): string {
    const amount = -0.2;
    const colorValue = parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.min(255, (colorValue >> 16) + Math.round(255 * amount)));
    const g = Math.max(0, Math.min(255, ((colorValue >> 8) & 0x00ff) + Math.round(255 * amount)));
    const b = Math.max(0, Math.min(255, (colorValue & 0x0000ff) + Math.round(255 * amount)));
    return `rgb(${r}, ${g}, ${b})`;
}
