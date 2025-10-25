import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getTotalExpenses,
  getStatistics,
} from '../utils/storage';

const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);
    setStats(getStatistics(loadedExpenses));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddExpense = (expenseData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
      showNotification('Gasto actualizado correctamente');
    } else {
      addExpense(expenseData);
      showNotification('Gasto agregado correctamente');
    }
    loadExpenses();
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      deleteExpense(id);
      showNotification('Gasto eliminado correctamente', 'info');
      loadExpenses();
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Notificación */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Gastado</p>
                <p className="text-3xl font-bold mt-1">
                  ${stats?.total.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Promedio Semanal</p>
                <p className="text-3xl font-bold mt-1">
                  ${stats?.weeklyAverage.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Gasto Más Alto</p>
                <p className="text-3xl font-bold mt-1">
                  ${stats?.highest.toFixed(2) || '0.00'}
                </p>
              </div>
              <Award className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total de Gastos</p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.count || 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Categoría con mayor gasto */}
        {stats?.topCategory && (
          <div className="card mb-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 border-l-4 border-primary-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Categoría con mayor gasto
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: stats.topCategory.color }}
                />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.topCategory.label}
                </span>
              </div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${stats.topCategory.total.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Formulario de gastos */}
        <div className="mb-8">
          <ExpenseForm
            onSubmit={handleAddExpense}
            editingExpense={editingExpense}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* Lista de gastos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mis Gastos
          </h2>
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
