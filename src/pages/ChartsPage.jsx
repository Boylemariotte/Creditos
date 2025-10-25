import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import CategoryChart from '../components/Charts/CategoryChart';
import TimeChart from '../components/Charts/TimeChart';
import {
  getExpenses,
  getExpensesByCategory,
  getExpensesByPeriod,
  getStatistics,
} from '../utils/storage';

const ChartsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      setTimeData(getExpensesByPeriod(period, expenses));
    }
  }, [period, expenses]);

  const loadData = () => {
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);
    setCategoryData(getExpensesByCategory(loadedExpenses));
    setTimeData(getExpensesByPeriod(period, loadedExpenses));
    setStats(getStatistics(loadedExpenses));
  };

  if (expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-16">
            <BarChart3 className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No hay datos para mostrar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega algunos gastos para ver tus análisis y gráficos
            </p>
            <a
              href="/"
              className="btn-primary inline-flex mx-auto"
            >
              Ir a Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Análisis de Gastos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualiza y analiza tus patrones de gasto
          </p>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <PieChartIcon className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Promedio por Gasto</h3>
            </div>
            <p className="text-3xl font-bold">
              ${stats?.average.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Promedio Mensual</h3>
            </div>
            <p className="text-3xl font-bold">
              ${stats?.monthlyAverage.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Total de Gastos</h3>
            </div>
            <p className="text-3xl font-bold">
              {stats?.count || 0} gastos
            </p>
          </div>
        </div>

        {/* Gráfico de gastos por tiempo */}
        <div className="mb-8">
          <TimeChart
            data={timeData}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        {/* Gráfico de gastos por categoría */}
        <div className="mb-8">
          <CategoryChart data={categoryData} />
        </div>

        {/* Información adicional */}
        {stats?.topCategory && (
          <div className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 border-l-4 border-primary-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Insights de tus Gastos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Tu categoría de mayor gasto es:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.topCategory.label} (${stats.topCategory.total.toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Gastos en {stats.topCategory.label}:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.topCategory.count} {stats.topCategory.count === 1 ? 'gasto' : 'gastos'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Porcentaje del total:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {((stats.topCategory.total / stats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsPage;
