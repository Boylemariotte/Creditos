import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Award, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';
import ViewToggle from '../components/ViewToggle';
import { useAuth } from '../context/AuthContext';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getStatistics,
  getIncomes,
  addIncome,
  deleteIncome,
  getTotalIncomes,
  formatCurrency
} from '../utils/storage';

const Home = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [stats, setStats] = useState(null);
  const [partnerStats, setPartnerStats] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('personal'); // 'personal' or 'joint'
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'incomes'

  useEffect(() => {
    loadData();
  }, [mode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedExpenses, loadedIncomes] = await Promise.all([
        getExpenses(mode),
        getIncomes(mode)
      ]);

      setExpenses(loadedExpenses);
      setIncomes(loadedIncomes);

      if (mode === 'joint') {
        const myExpenses = loadedExpenses.filter(e => e.userId === user.id);
        const pExpenses = loadedExpenses.filter(e => e.userId !== user.id);
        setStats(getStatistics(myExpenses));
        setPartnerStats(getStatistics(pExpenses));
      } else {
        setStats(getStatistics(loadedExpenses));
        setPartnerStats(null);
      }
    } catch (error) {
      showNotification('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- EXPENSE HANDLERS ---
  const handleAddExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        setEditingExpense(null);
        showNotification('Gasto actualizado correctamente');
      } else {
        await addExpense(expenseData);
        showNotification('Gasto agregado correctamente');
      }
      loadData();
    } catch (error) {
      showNotification('Error al guardar el gasto', 'error');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await deleteExpense(id);
        showNotification('Gasto eliminado correctamente', 'info');
        loadData();
      } catch (error) {
        showNotification('Error al eliminar el gasto', 'error');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // --- INCOME HANDLERS ---
  const handleAddIncome = async (incomeData) => {
    try {
      await addIncome(incomeData);
      showNotification('Ingreso registrado correctamente');
      loadData();
    } catch (error) {
      showNotification('Error al guardar el ingreso', 'error');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        await deleteIncome(id);
        showNotification('Ingreso eliminado correctamente', 'info');
        loadData();
      } catch (error) {
        showNotification('Error al eliminar el ingreso', 'error');
      }
    }
  };

  // --- CALCULATIONS ---
  // Filter incomes to get only the current user's income
  const myIncomes = incomes.filter(i => i.userId === user.id);
  const totalIncome = getTotalIncomes(myIncomes);

  // stats?.total always contains "My Expenses" (in both personal and joint mode logic)
  const totalExpenses = stats?.total || 0;

  const balance = totalIncome - totalExpenses;

  if (loading && !expenses.length && !incomes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Notificación */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in ${notification.type === 'success'
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

        {user?.partnerId && (
          <div className="flex justify-center mb-6">
            <ViewToggle mode={mode} setMode={setMode} />
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm font-medium mb-1">Mi Balance</p>
              <h2 className={`text-4xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatCurrency(balance)}
              </h2>
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <ArrowUpCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Ingresos</p>
                  <p className="text-xl font-semibold text-green-400">+{formatCurrency(totalIncome)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <ArrowDownCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Gastos</p>
                  <p className="text-xl font-semibold text-red-400">-{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm inline-flex">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'expenses'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'incomes'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              Ingresos
            </button>
          </div>
        </div>

        {activeTab === 'expenses' ? (
          <>
            {/* Estadísticas principales */}
            {mode === 'joint' && partnerStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* My Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-primary-500">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mis Gastos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Promedio Sem.</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(stats?.weeklyAverage)}</p>
                    </div>
                  </div>
                </div>

                {/* Partner Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-pink-500">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos de Pareja</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(partnerStats?.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Promedio Sem.</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(partnerStats?.weeklyAverage)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Gastado</p>
                      <p className="text-3xl font-bold mt-1">
                        {formatCurrency(stats?.total)}
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
                        {formatCurrency(stats?.weeklyAverage)}
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
                        {formatCurrency(stats?.highest)}
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
            )}

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
                    {formatCurrency(stats.topCategory.total)}
                  </span>
                </div>
              </div>
            )}

            {/* Formulario de gastos (Solo en modo personal) */}
            {mode === 'personal' && (
              <div className="mb-8">
                <ExpenseForm
                  onSubmit={handleAddExpense}
                  editingExpense={editingExpense}
                  onCancel={handleCancelEdit}
                />
              </div>
            )}

            {/* Lista de gastos */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {mode === 'joint' ? 'Gastos de Pareja' : 'Mis Gastos'}
              </h2>
              <ExpenseList
                expenses={expenses}
                onEdit={mode === 'personal' ? handleEditExpense : undefined}
                onDelete={mode === 'personal' ? handleDeleteExpense : undefined}
              />
            </div>
          </>
        ) : (
          <>
            {/* Sección de Ingresos */}
            {mode === 'personal' && (
              <IncomeForm onSubmit={handleAddIncome} />
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {mode === 'joint' ? 'Ingresos de Pareja' : 'Mis Ingresos'}
              </h2>
              <IncomeList
                incomes={incomes}
                onDelete={mode === 'personal' ? handleDeleteIncome : undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
