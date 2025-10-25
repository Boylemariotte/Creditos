import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const TimeChart = ({ data, period, onPeriodChange }) => {
  const [chartType, setChartType] = useState('area'); // 'line' o 'area'

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  const formatPeriodLabel = (periodStr) => {
    if (period === 'day') {
      const date = new Date(periodStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } else if (period === 'week') {
      const date = new Date(periodStr);
      return `Sem ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
    } else if (period === 'month') {
      const [year, month] = periodStr.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    } else if (period === 'year') {
      return periodStr;
    }
    return periodStr;
  };

  const chartData = data.map(item => ({
    period: formatPeriodLabel(item.period),
    total: parseFloat(item.total.toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.period}</p>
          <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const periodLabels = {
    day: 'Diario',
    week: 'Semanal',
    month: 'Mensual',
    year: 'Anual',
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Gastos en el Tiempo
        </h3>

        <div className="flex gap-2">
          {/* Selector de periodo */}
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border-0 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="day">Diario</option>
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>

          {/* Selector de tipo de gráfico */}
          <button
            onClick={() => setChartType(prev => prev === 'area' ? 'line' : 'area')}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Cambiar tipo de gráfico"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="period"
              className="text-gray-700 dark:text-gray-300"
              tick={{ fill: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-gray-700 dark:text-gray-300"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={800}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="period"
              className="text-gray-700 dark:text-gray-300"
              tick={{ fill: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-gray-700 dark:text-gray-300"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 5 }}
              activeDot={{ r: 7 }}
              animationDuration={800}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Estadísticas rápidas */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Total {periodLabels[period]}</div>
          <div className="text-2xl font-bold mt-1">
            ${chartData.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Promedio</div>
          <div className="text-2xl font-bold mt-1">
            ${(chartData.reduce((sum, d) => sum + d.total, 0) / chartData.length).toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Máximo</div>
          <div className="text-2xl font-bold mt-1">
            ${Math.max(...chartData.map(d => d.total)).toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-lg p-4">
          <div className="text-sm opacity-90">Mínimo</div>
          <div className="text-2xl font-bold mt-1">
            ${Math.min(...chartData.map(d => d.total)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeChart;
