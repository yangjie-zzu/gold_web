import { BaseChart } from "../components/BaseChart";
import type { gold_price } from "../schema/gold";
import * as d3 from "d3";
import React, { useCallback, useEffect } from "react";
import "./LineChart.css";
import { Count } from "../components/Count";
import { AvgPrice } from "./AvgPrice";

// 日期中文本地化
d3.timeFormatDefaultLocale({
    dateTime: "%Y年%m月%d日 %A %p %I:%M:%S",
    date: "%Y-%m-%d",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    shortDays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    shortMonths: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月",
        "9月", "10月", "11月", "12月"]
});

export function LineChart() {

    const [data, setData] = React.useState<gold_price[]>(localStorage.getItem('gold_prices') ? JSON.parse(localStorage.getItem('gold_prices')) : []);

    const [loading, setLoading] = React.useState(false);

    const queryData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/gold/price');
            const fetchedData = await res.json() as gold_price[];
            console.log('fetchedData', fetchedData?.length);
            setData(fetchedData);
        } finally {
            setLoading(false);
        }
    }

    const queryDataRef = React.useRef(queryData);
    queryDataRef.current = queryData;

    useEffect(() => {
        queryDataRef.current();
    }, [queryDataRef]);

    const lastList = data?.filter(item => item.price_time_type === 'last')

    const last = lastList?.[lastList?.length - 1];

    const date = last?.price_time == null ? null : d3.timeFormat("%Y-%m-%d %H:%M:%S")(new Date(parseFloat(last?.price_time)));

    return (
        <div style={{ width: '100%' }}>
            <BaseChart style={{ height: '50vw', background: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                renderChart={useCallback((container) => {
                    if ((data?.length || 0) === 0) {
                        return;
                    }
                    // Clear previous chart
                    d3.select(container).selectAll("*").remove();

                    const margin = { top: 20, right: 44, bottom: 30, left: 50 };
                    const width = container.clientWidth - margin.left - margin.right;
                    const height = container.clientHeight - margin.top - margin.bottom;

                    const svg = d3.select(container)
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    // Parse the date / time
                    const parseTime = t => new Date(parseFloat(t));

                    // Format the data
                    const formattedData = data.map(d => ({
                        ...d,
                        price_time: parseTime(d.price_time),
                        price: d.price,
                    })).filter(d => d.price_time != null).sort((a, b) => a.price_time.getTime() - b.price_time.getTime());

                    // Set the ranges
                    const x = d3.scaleTime()
                        .domain(d3.extent(formattedData, d => d.price_time))
                        .range([0, width]);

                    const y = d3.scaleLinear()
                        .domain([0, d3.max(formattedData, d => parseFloat(d.price))])
                        .nice()
                        .range([height, 0]);

                    // Define the line
                    const line = d3.line<gold_price>()
                        .x(d => {
                            const v = x(parseTime(d.price_time));
                            return v;
                        })
                        .y(d => {
                            const v = y(parseFloat(d.price));
                            return v;
                        });

                    // Add the X Axis
                    const gx = svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .attr("class", "x-axis")
                        .call(d3.axisBottom(x).tickFormat((v, i) => {
                            return d3.timeFormat("%Y-%m-%d %H:%M")(v as Date);
                        }).tickValues((() => {
                            return [
                                formattedData?.[0]?.price_time,
                                formattedData?.[formattedData?.length - 1]?.price_time
                            ];
                        })()));
                    
                    gx.selectAll('.tick text')
                        .attr('text-anchor', (d, i) => i === 0 ? 'start' : 'end')

                    // Add the Y Axis
                    svg.append("g")
                        .call(d3.axisLeft(y));
                    // Add the last line path
                    svg.append("path")
                        .datum(formattedData)
                        .attr("fill", "none")
                        .attr("stroke", "orange")
                        .attr("stroke-width", 1.5)
                        .attr("d", line(data?.filter(d => d.price_time_type === 'last') || []));
                    // Add the date line path
                    svg.append("path")
                        .datum(formattedData)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", line(data?.filter(d => d.price_time_type === 'date') || []));
                }, [data])}
            />
            <div style={{paddingLeft: 16}}>最新价格: <Count val={parseFloat(last?.price)}/>;<br />时间: {date}</div>
            <BaseChart style={{ height: '50vw', background: 'transparent' }}
                renderChart={useCallback((container) => {
                    if ((data?.length || 0) === 0) {
                        return;
                    }
                    const list = data?.filter(d => d.price_time_type === 'last')
                        ?.sort((a, b) => (parseFloat(a.price_time) - parseFloat(b.price_time)));
                    // Clear previous chart
                    d3.select(container).style('position', 'relative').selectAll("*").remove();

                    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
                    const width = container.clientWidth - margin.left - margin.right;
                    const height = container.clientHeight - margin.top - margin.bottom;

                    // Parse the date / time
                    const parseTime = t => new Date(parseFloat(t));

                    const totalWidth = width * ((parseFloat(list[list.length - 1]?.price_time) - parseFloat(list[0]?.price_time)) / (1000 * 60 * 60 * 24));

                    const svgWrapper = d3.select(container).append('div')
                        .style('width', `${width + margin.left + margin.right}px`)
                        .style('padding-left', `${margin.left}px`)
                        .style('padding-right', `${margin.right}px`)
                        .append('div')
                        .style('height', `auto`)
                        .style('overflow-x', 'auto')

                    const svg = svgWrapper.append('svg')
                        .attr("width", totalWidth + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    const ySvgWrapper = d3.select(container).append('div')
                        .style('width', `${width + margin.left + margin.right}px`)
                        .style('height', `auto`)
                        .style('position', 'absolute')
                        .style('top', `0`)
                        .style('left', `0`)
                        .style('pointer-events', 'none');

                    const ySvg = ySvgWrapper.append('svg')
                        .attr("width", width)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);


                    // Format the data
                    const formattedData = list.map(d => ({
                        ...d,
                        price_time: parseTime(d.price_time),
                        price: d.price,
                    })).filter(d => d.price_time != null).sort((a, b) => a.price_time.getTime() - b.price_time.getTime());

                    // Set the ranges
                    const x = d3.scaleTime()
                        .domain(d3.extent(formattedData, d => d.price_time))
                        .range([0, totalWidth]);

                    const y = d3.scaleLinear()
                        .domain([d3.min(formattedData, d => parseFloat(d.price)), d3.max(formattedData, d => parseFloat(d.price))])
                        .nice()
                        .range([height, 0]);

                    // Define the line
                    const line = d3.line<gold_price>()
                        .x(d => {
                            const v = x(parseTime(d.price_time));
                            return v;
                        })
                        .y(d => {
                            const v = y(parseFloat(d.price));
                            return v;
                        });

                    // Add the X Axis
                    svg.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x).tickFormat((v, i) => {
                            const h = (v as Date).getHours();
                            return h.toString();
                        }).tickValues((() => {
                            const set = new Set(data?.map(d => {
                                const date = parseTime(d.price_time);
                                const str = d3.timeFormat("%Y-%m-%d %H")(date);
                                return str;
                            }) || []);
                            return Array.from(set).map(d => d3.timeParse("%Y-%m-%d %H")(d));
                        })()).tickSize(-height)).attr('stroke-opacity', 0.15);

                    // 添加Y轴，绘制网格线
                    ySvg.append("g")
                        .call(d3.axisLeft(y).tickSize(-width)).attr('stroke-opacity', 0.15);
                    // Add the line path
                    svg.append("path")
                        .datum(formattedData)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", line(list));

                    svg.on('mouseleave', () => {
                        // toolTip.hide();
                    });

                    // 筛选出0点日期，开始时间，结束时间

                    const startDate = new Date(formattedData[0]?.price_time);
                    const zeroStartDate = new Date(startDate);
                    zeroStartDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(formattedData[formattedData.length - 1]?.price_time);
                    const zeroEndDate = new Date(endDate);
                    zeroEndDate.setHours(0, 0, 0, 0);
                    const zeroDates = [];
                    for (const date = zeroStartDate; date <= zeroEndDate; date.setDate(date.getDate() + 1)) {
                        if (date.getTime() <= endDate.getTime()) {
                            zeroDates.push(new Date(date));
                        }
                    }

                    // 绘制竖线
                    svg.selectAll('.zero-line')
                        .data(zeroDates)
                        .enter()
                        .append('g')
                        .attr('class', 'zero-line')
                        .attr('transform', (d) => `translate(${x(d)},0)`)
                        .append('line')
                        .attr('class', 'zero-line')
                        .attr('y2', height)
                        .attr('stroke', 'gray')
                    // 添加日期标签
                    svg.selectAll('.date')
                        .data(zeroDates.slice(0, zeroDates.length - 1))
                        .enter()
                        .append('text')
                        .attr('class', 'date')
                        .attr('x', (d, i) => {
                            const next = zeroDates[i + 1];
                            if (next) {
                                return x(d) + (x(next) - x(d)) / 2;
                            }
                        })
                        .attr('y', -8)
                        .attr('width', (d, i) => {
                            const next = zeroDates[i + 1];
                            if (next) {
                                return x(next) - x(d);
                            }
                        })
                        .attr('font-size', 12)
                        .attr('text-anchor', 'middle')
                        .text(d => d3.timeFormat("%m月%d日%a")(d));
                    setTimeout(() => {
                        svgWrapper.node()?.scrollTo({ left: totalWidth });
                    });
                }, [data])}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <button onClick={queryData}>{loading ? '请求中' : '刷新'}</button>
            </div>
            <AvgPrice />
        </div>
    );
}