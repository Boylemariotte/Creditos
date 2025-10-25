// Clave para almacenar gastos en localStorage
const EXPENSES_KEY = 'migasto_expenses';
const THEME_KEY = 'migasto_theme';

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
export const getExpenses = () => {
  try {
    const expenses = localStorage.getItem(EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  } catch (error) {
    console.error('Error al cargar gastos:', error);
    return [];
  }
};

// Guardar todos los gastos
export const saveExpenses = (expenses) => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return true;
  } catch (error) {
    console.error('Error al guardar gastos:', error);
    return false;
  }
};

// Agregar un nuevo gasto
export const addExpense = (expense) => {
  const expenses = getExpenses();
  const newExpense = {
    id: Date.now().toString(),
    ...expense,
    date: expense.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

// Actualizar un gasto existente
export const updateExpense = (id, updatedData) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(exp => exp.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updatedData };
    saveExpenses(expenses);
    return expenses[index];
  }
  return null;
};

// Eliminar un gasto
export const deleteExpense = (id) => {
  const expenses = getExpenses();
  const filtered = expenses.filter(exp => exp.id !== id);
  saveExpenses(filtered);
  return filtered;
};

// Obtener el total de gastos
export const getTotalExpenses = (expenses = null) => {
  const expenseList = expenses || getExpenses();
  return expenseList.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
};

// Obtener gastos por categoría
export const getExpensesByCategory = (expenses = null) => {
  const expenseList = expenses || getExpenses();
  const byCategory = {};
  
  CATEGORIES.forEach(cat => {
    byCategory[cat.value] = {
      label: cat.label,
      total: 0,
      count: 0,
      color: cat.color,
    };
  });

  expenseList.forEach(expense => {
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
export const getExpensesByPeriod = (period = 'month', expenses = null) => {
  const expenseList = expenses || getExpenses();
  const grouped = {};

  expenseList.forEach(expense => {
    const date = new Date(expense.date);
    let key;

    if (period === 'day') {
      key = expense.date;
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
export const getStatistics = (expenses = null) => {
  const expenseList = expenses || getExpenses();
  
  if (expenseList.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      topCategory: null,
      weeklyAverage: 0,
      monthlyAverage: 0,
    };
  }

  const total = getTotalExpenses(expenseList);
  const average = total / expenseList.length;
  const highest = Math.max(...expenseList.map(e => parseFloat(e.amount || 0)));
  
  const byCategory = getExpensesByCategory(expenseList);
  const topCategory = byCategory.reduce((max, cat) => 
    cat.total > (max?.total || 0) ? cat : max, null
  );

  // Calcular promedio semanal
  const dates = expenseList.map(e => new Date(e.date).getTime());
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
    count: expenseList.length,
  };
};

// Filtrar gastos por rango de fechas
export const filterExpensesByDateRange = (startDate, endDate, expenses = null) => {
  const expenseList = expenses || getExpenses();
  return expenseList.filter(expense => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  });
};

// Exportar gastos a CSV
export const exportToCSV = (expenses = null) => {
  const expenseList = expenses || getExpenses();
  
  if (expenseList.length === 0) {
    return null;
  }

  const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto'];
  const rows = expenseList.map(exp => [
    exp.date,
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
export const downloadCSV = (expenses = null) => {
  const csvContent = exportToCSV(expenses);
  
  if (!csvContent) {
    alert('No hay gastos para exportar');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `migasto_gastos_${new Date().toISOString().split('T')[0]}.csv`);
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
