import { useState } from 'react';
import { Cell, Pie, PieChart, Label, LabelList } from 'recharts';

interface CardData {
    category: string,
    day: string,
    id: number,
    name: string,
    payment: number
}

interface TotalProps {
    data: CardData[]
}

interface InvertedColorPalette {
    '旅行': string;
    '経費': string;
    '交通費': string;
    '生活必需品': string;
    'サブスク': string;
    '外出': string;
    '娯楽': string;
    'その他': string;
}

function Graph({ data }: TotalProps) {
    const rakutenData = data.filter(item => item.id < 500);
    const aeonData = data.filter(item => item.id >= 500 && item.id < 1000);
    const cashData = data.filter(item => item.id >= 1000);

    const [totalButton, setTotalButton] = useState<boolean>(true);
    const [rakutenButton, setRakutenButton] = useState<boolean>(false);
    const [aeonButton, setAeonButton] = useState<boolean>(false);
    const [cashButton, setCashButton] = useState<boolean>(false);

    const handleTotaleClick = () => {
        setRakutenButton(false);
        setAeonButton(false);
        setTotalButton(true);
        setCashButton(false);
    };

    const handleRakutenClick = () => {
        setRakutenButton(true);
        setAeonButton(false);
        setTotalButton(false);
        setCashButton(false);
    };

    const handleAeonClick = () => {
        setRakutenButton(false);
        setAeonButton(true);
        setTotalButton(false);
        setCashButton(false);
    };

    const handleCashClick = () => {
        setRakutenButton(false);
        setAeonButton(false);
        setTotalButton(false);
        setCashButton(true);
    };

    const OrgData = (sumple: CardData[]) => {
        const totals: { [key in keyof InvertedColorPalette]: number } = {
            '旅行': 0,
            '経費': 0,
            '交通費': 0,
            '生活必需品': 0,
            'サブスク': 0,
            '外出': 0,
            '娯楽': 0,
            'その他': 0
        };

        sumple.forEach((item) => {
            if (totals[item.category as keyof InvertedColorPalette] !== undefined) {
                totals[item.category as keyof InvertedColorPalette] += item.payment;
            }
        });

        const results = Object.keys(totals)
            .filter(category => totals[category as keyof InvertedColorPalette] > 0)
            .map((category) => ({
                name: category,
                value: totals[category as keyof InvertedColorPalette]
            }));

        return results;
    };

    const totalResults = OrgData(data);
    const rakutenResults = OrgData(rakutenData);
    const aeonResults = OrgData(aeonData);
    const cashResults = OrgData(cashData);

    const isEmpty = (totalButton && totalResults.length === 0) ||
                    (rakutenButton && rakutenResults.length === 0) ||
                    (aeonButton && aeonResults.length === 0) || 
                    (cashButton && cashResults.length === 0);

    return (
        <div className="graph-container">
            <div className="button-container">
                <button className={`category_button_graph total ${totalButton ? 'active' : ''}`} disabled={totalButton} onClick={handleTotaleClick}>トータル</button>
                <button className={`category_button_graph rakuten ${rakutenButton ? 'active' : ''}`} disabled={rakutenButton} onClick={handleRakutenClick}>楽天カード</button>
                <button className={`category_button_graph aeon ${aeonButton ? 'active' : ''}`} disabled={aeonButton} onClick={handleAeonClick}>イオンカード</button>
                <button className={`category_button_graph cash ${cashButton ? 'active' : ''}`} disabled={cashButton} onClick={handleCashClick}>現金</button>
            </div>
            <div className="chart-wrapper">
                {isEmpty ? (
                    <div className="empty-message">
                        <h2>データがありません</h2>
                    </div>
                ) : (
                    <div className="piechart-container">
                        <PieChart width={700} height={700}>
                            <Pie
                                data={totalButton ? totalResults : (rakutenButton ? rakutenResults : (aeonButton ? aeonResults : cashResults))}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={250} /* グラフサイズを大きく調整 */
                                innerRadius={120}
                                label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius + 30;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    return (
                                        <text
                                            x={x}
                                            y={y}
                                            fill="black"
                                            fontWeight="bold"
                                            fontSize={14}
                                            textAnchor={x > cx ? "start" : "end"}
                                            dominantBaseline="central"
                                        >
                                            {name}
                                        </text>
                                    );
                                }}
                                labelLine={false}
                            >
                                {(totalButton ? totalResults : (rakutenButton ? rakutenResults : (aeonButton ? aeonResults : cashResults))).map((entry) => (
                                    <Cell key={entry.name} fill={invertedColorPalette[entry.name as keyof InvertedColorPalette]} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="inside"
                                    fill="white"
                                    stroke="none"
                                    fontSize={12}
                                    fontWeight="bold"
                                />
                                <Label
                                    value={`計: ${(totalButton ? data : (rakutenButton ? rakutenData : (aeonButton ? aeonData : cashData))).reduce((acc, item) => acc + item.payment, 0)}円`}
                                    position="center"
                                    fontSize={20}
                                    fontWeight="bold"
                                    fill="#333"
                                />
                            </Pie>
                        </PieChart>
                    </div>
                )}
            </div>
        </div>
    );
}

const invertedColorPalette: InvertedColorPalette = {
    '旅行': '#2E86C1',
    '経費': '#28B463',
    '交通費': '#F39C12',
    '生活必需品': '#8E44AD',
    'サブスク': '#E74C3C',
    '外出': '#1ABC9C',
    '娯楽': '#D35400',
    'その他': '#5D6D7E'
};

export default Graph;
