// Clave para almacenar tema en localStorage
const THEME_KEY = 'noda_theme';
import API_URL from '../config';


const EXPENSE_API_URL = `${API_URL}/expenses`;

// ... (rest of the file)

// Helper to get headers with token
export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0';

  // Format integer part with dots for thousands
  let formatted = num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Replace the millions separator (if it exists) with apostrophe
  // Logic: The millions separator is the 2nd dot from the right (if number >= 1 million)
  // Example: 1.200.000 -> 1'200.000
  // Example: 18.000 -> 18.000

  // We can use a regex to find the dot that is followed by 6 digits (and maybe more dots)
  // \.(?=\d{3}\.\d{3}) matches the dot before the last 6 digits (millions separator)

  formatted = formatted.replace(/\.(?=\d{3}\.\d{3}$)/, "'");

  // Handle Billions: 1.000'000.000
  // The regex above only replaces the dot before the last 6 digits.
  // If we have 1.234.567.890 -> 1.234'567.890
  // It seems correct based on "millions apostrophe".

  return `$${formatted}`;
};

// Categorías disponibles
export const CATEGORIES = [
  { value: 'comida', label: 'Comida', color: '#ef4444' },
  { value: 'transporte', label: 'Transporte', color: '#f59e0b' },
  { value: 'ocio', label: 'Ocio', color: '#8b5cf6' },
  { value: 'salud', label: 'Salud', color: '#10b981' },
  { value: 'educacion', label: 'Educación', color: '#3b82f6' },
  { value: 'servicios', label: 'Servicios', color: '#06b6d4' },
  { value: 'compras', label: 'Compras', color: '#ec4899' },
  { value: 'otros', label: 'Otros', color: '#6b7280' },
];

// Obtener todos los gastos
export const getExpenses = async (mode = 'personal') => {
  try {
    const url = mode ? `${EXPENSE_API_URL}?mode=${mode}` : EXPENSE_API_URL;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error fetching expenses');
    return await response.json();
  } catch (error) {
    console.error('Error al cargar gastos:', error);
    return [];
  }
};

// Agregar un nuevo gasto
export const addExpense = async (expense) => {
  try {
    const response = await fetch(EXPENSE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Error adding expense');
    return await response.json();
  } catch (error) {
    console.error('Error al agregar gasto:', error);
    throw error;
  }
};

// Actualizar un gasto existente
export const updateExpense = async (id, updatedData) => {
  try {
    const response = await fetch(`${EXPENSE_API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error('Error updating expense');
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    throw error;
  }
};

// Eliminar un gasto
export const deleteExpense = async (id) => {
  try {
    const response = await fetch(`${EXPENSE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error deleting expense');
    return true;
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    throw error;
  }
};

// Obtener el total de gastos
export const getTotalExpenses = (expenses = []) => {
  return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
};

// Obtener gastos por categoría
export const getExpensesByCategory = (expenses = []) => {
  const byCategory = {};

  CATEGORIES.forEach(cat => {
    byCategory[cat.value] = {
      label: cat.label,
      total: 0,
      count: 0,
      color: cat.color,
    };
  });

  expenses.forEach(expense => {
    const category = expense.category || 'otros';
    if (byCategory[category]) {
      byCategory[category].total += parseFloat(expense.amount || 0);
      byCategory[category].count += 1;
    }
  });

  return Object.entries(byCategory)
    .map(([key, value]) => ({ category: key, ...value }))
    .filter(item => item.total > 0);
};

// Obtener gastos por periodo (día, semana, mes)
export const getExpensesByPeriod = (period = 'month', expenses = []) => {
  const grouped = {};

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    let key;

    if (period === 'day') {
      key = expense.date.split('T')[0]; // Ensure date format
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (period === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'year') {
      key = date.getFullYear().toString();
    }

    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += parseFloat(expense.amount || 0);
  });

  return Object.entries(grouped)
    .map(([period, total]) => ({ period, total }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

// Obtener estadísticas
export const getStatistics = (expenses = []) => {
  if (expenses.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      topCategory: null,
      weeklyAverage: 0,
      monthlyAverage: 0,
      count: 0,
    };
  }

  const total = getTotalExpenses(expenses);
  const average = total / expenses.length;
  const highest = Math.max(...expenses.map(e => parseFloat(e.amount || 0)));

  const byCategory = getExpensesByCategory(expenses);
  const topCategory = byCategory.reduce((max, cat) =>
    cat.total > (max?.total || 0) ? cat : max, null
  );

  // Calcular promedio semanal
  const dates = expenses.map(e => new Date(e.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const weeks = Math.max(daysDiff / 7, 1);
  const weeklyAverage = total / weeks;

  // Calcular promedio mensual
  const months = Math.max(daysDiff / 30, 1);
  const monthlyAverage = total / months;

  return {
    total,
    average,
    highest,
    topCategory,
    weeklyAverage,
    monthlyAverage,
    count: expenses.length,
  };
};

// Filtrar gastos por rango de fechas
export const filterExpensesByDateRange = (startDate, endDate, expenses = []) => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  });
};

// Exportar gastos a CSV
export const exportToCSV = (expenses = []) => {
  if (expenses.length === 0) {
    return null;
  }

  const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto'];
  const rows = expenses.map(exp => [
    new Date(exp.date).toLocaleDateString(),
    exp.description,
    CATEGORIES.find(c => c.value === exp.category)?.label || exp.category,
    exp.amount,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Descargar CSV
export const downloadCSV = (expenses = []) => {
  const csvContent = exportToCSV(expenses);

  if (!csvContent) {
    alert('No hay gastos para exportar');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `noda_gastos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Gestión del tema
export const getTheme = () => {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme || 'light';
  } catch (error) {
    return 'light';
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch (error) {
    return false;
  }
};

// --- INCOME FUNCTIONS ---

const INCOME_API_URL = `${API_URL}/incomes`;

// Obtener todos los ingresos
export const getIncomes = async (mode = 'personal') => {
  try {
    const url = mode ? `${INCOME_API_URL}?mode=${mode}` : INCOME_API_URL;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error fetching incomes');
    return await response.json();
  } catch (error) {
    console.error('Error al cargar ingresos:', error);
    return [];
  }
};

// Agregar un nuevo ingreso
export const addIncome = async (income) => {
  try {
    const response = await fetch(INCOME_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(income),
    });
    if (!response.ok) throw new Error('Error adding income');
    return await response.json();
  } catch (error) {
    console.error('Error al agregar ingreso:', error);
    throw error;
  }
};

// Eliminar un ingreso
export const deleteIncome = async (id) => {
  try {
    const response = await fetch(`${INCOME_API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error deleting income');
    return true;
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    throw error;
  }
};

// Obtener el total de ingresos
export const getTotalIncomes = (incomes = []) => {
  return incomes.reduce((total, income) => total + parseFloat(income.amount || 0), 0);
};

// --- EVENTS FUNCTIONS ---

const EVENT_API_URL = `${API_URL}/events`;

// Obtener todos los eventos
export const getEvents = async () => {
  try {
    const response = await fetch(EVENT_API_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error fetching events');
    return await response.json();
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    return [];
  }
};

// Agregar un nuevo evento
export const addEvent = async (event) => {
  try {
    const response = await fetch(EVENT_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Error adding event');
    return await response.json();
  } catch (error) {
    console.error('Error al agregar evento:', error);
    throw error;
  }
};

// Eliminar un evento
export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${EVENT_API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error deleting event');
    return true;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    throw error;
  }
};
