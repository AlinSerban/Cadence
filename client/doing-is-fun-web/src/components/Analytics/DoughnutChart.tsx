import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { forwardRef, useImperativeHandle, useRef } from 'react';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface DoughnutChartProps {
    data: any;
    options: any;
}

export const DoughnutChart = forwardRef<ChartJS<'doughnut'>, DoughnutChartProps>(({ data, options }, ref) => {
    const chartRef = useRef<ChartJS<'doughnut'>>(null);

    useImperativeHandle(ref, () => chartRef.current!, []);

    return <Doughnut ref={chartRef} data={data} options={options} />;
});
