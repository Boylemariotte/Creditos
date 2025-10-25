import { Edit2, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../utils/storage';

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const category = CATEGORIES.find(cat => cat.value === expense.category);
  const categoryColor = category?.color || '#6b7280';
  const categoryLabel = category?.label || expense.category;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        {/* Indicador de categoría */}
        <div
          className="w-1 h-16 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />

        {/* Información del gasto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {expense.description}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {categoryLabel}
            </span>
            <span>{formatDate(expense.date)}</span>
          </div>
        </div>

        {/* Monto */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ${parseFloat(expense.amount).toFixed(2)}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(expense)}
            className="btn-icon text-blue-600 hover:text-blue-700 dark:text-blue-400"
            aria-label="Editar gasto"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="btn-icon text-red-600 hover:text-red-700 dark:text-red-400"
            aria-label="Eliminar gasto"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
