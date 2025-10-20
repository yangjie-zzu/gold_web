import React, { useEffect } from "react";
import CountUp from "react-countup";
import type { CountUpProps } from "react-countup";

export const Count: React.FC<{ val: number } & Omit<CountUpProps, "start" | "end">> = ({ val, ...rest }) => {

    const [innerVal, setInnerVal] = React.useState<number>(val);

    const getDecimalPlaces = (num: number): number => {
        const numStr = num.toString();
        if (numStr.includes('.')) {
            return numStr.split('.')[1].length;
        }
        return 0;
    };

    const decimalPlaces = Math.max(getDecimalPlaces(innerVal), getDecimalPlaces(val));

    useEffect(() => {
        setInnerVal(val);
    }, [val]);

    return <CountUp start={innerVal} end={val} {...rest} decimals={decimalPlaces}/>;
}