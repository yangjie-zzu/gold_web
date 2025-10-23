import React from "react";

export const FieldWrapper: React.FC<{
    label: string;
    children: React.ReactNode;
}> = ({label, children}) => {
    return (
        <div style={{display: 'flex', gap: 4}}>
            <div>
                {label}
            </div>
            <div>{children}</div>
        </div>
    );
}

const getLocalNumber = (key: string): number | undefined => {
    const value = localStorage.getItem(key);
    if (value) {
        return parseFloat(value);
    }
    return undefined;
}

export const AvgPrice = () => {

    const [money, setMoney] = React.useState<number>(getLocalNumber('money'));
    const [gram, setGram] = React.useState<number>(getLocalNumber('gram'));
    const [buyMoney, setBuyMoney] = React.useState<number>(getLocalNumber('buyMoney'));
    const [buyPrice, setBuyPrice] = React.useState<number>(getLocalNumber('buyPrice'));

    const price = money / gram;
    const totalMoney = buyMoney + money;
    const buyGram = buyMoney / buyPrice;
    const totalGram = buyGram + gram;
    const avgPrice = totalMoney / totalGram;

    const displayNumber = (num: number) => {
        return isNaN(num) || !isFinite(num) ? '--' : num.toFixed(2);
    }

    return (
        <div>
            <div>
                <FieldWrapper label="当前总额">
                    <input type="number" value={money} onChange={e => {
                        setMoney(parseFloat(e.target.value));
                    }}/>
                </FieldWrapper>
                <FieldWrapper label="当前克数">
                    <input type="number" value={gram} onChange={e => {
                        setGram(parseFloat(e.target.value));
                    }}/>
                </FieldWrapper>
                <FieldWrapper label="购买总额">
                    <input type="number" value={buyMoney} onChange={e => {
                        setBuyMoney(parseFloat(e.target.value));
                    }}/>
                </FieldWrapper>
                <FieldWrapper label="购买价格">
                    <input type="number" value={buyPrice} onChange={e => {
                        setBuyPrice(parseFloat(e.target.value));
                    }}/>
                </FieldWrapper>
            </div>
            <div style={{marginTop: 16}}>
                <div>当前均价: {displayNumber(price)}</div>
                <div>购买后均价: {displayNumber(avgPrice)}</div>
                <div>购买克数: {displayNumber(buyGram)}</div>
                <div>购买后总额: {displayNumber(totalMoney)}</div>
                <div>购买后总克数: {displayNumber(totalGram)}</div>
            </div>
        </div>
    );
}