import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { forwardRef, useImperativeHandle, useRef } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
    data: any;
    options: any;
}

export const BarChart = forwardRef<ChartJS, BarChartProps>(({ data, options }, ref) => {
    const chartRef = useRef<ChartJS>(null);

    useImperativeHandle(ref, () => chartRef.current!, []);

    return <Bar ref={chartRef} data={data} options={options} />;
});
