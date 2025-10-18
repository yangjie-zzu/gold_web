import React from "react";

export function BaseChart({ renderChart, ...rest }: {
    renderChart: (renderChart: HTMLDivElement) => void,
} & React.HTMLAttributes<HTMLDivElement>) {

    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (containerRef.current) {
            renderChart(containerRef.current);
        }
    }, [renderChart]);

    return (
        <div {...rest} ref={containerRef}>

        </div>
    )
}