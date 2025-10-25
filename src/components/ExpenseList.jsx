import { useState } from 'react';
import { Search, SortAsc, SortDesc, Download } from 'lucide-react';
import ExpenseItem from './ExpenseItem';
import { CATEGORIES, downloadCSV } from '../utils/storage';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = más reciente primero

  // Filtrar y ordenar gastos
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  const handleExport = () => {
    downloadCSV(filteredExpenses.length > 0 ? filteredExpenses : expenses);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="all">Todas las categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Ordenar */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="btn-secondary"
            aria-label="Cambiar orden"
          >
            {sortOrder === 'desc' ? (
              <SortDesc className="w-5 h-5" />
            ) : (
              <SortAsc className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
            </span>
          </button>

          {/* Exportar */}
          <button
            onClick={handleExport}
            className="btn-secondary"
            aria-label="Exportar a CSV"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Lista de gastos */}
      {filteredExpenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchTerm || filterCategory !== 'all'
              ? 'No se encontraron gastos con los filtros aplicados'
              : 'No hay gastos registrados. ¡Agrega tu primer gasto!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Resumen */}
      {filteredExpenses.length > 0 && (
        <div className="card bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Mostrando {filteredExpenses.length} de {expenses.length} gastos
            </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              Total: ${filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
