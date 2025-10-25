import { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { CATEGORIES } from '../utils/storage';

const ExpenseForm = ({ onSubmit, editingExpense, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: 'comida',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        category: editingExpense.category,
        amount: editingExpense.amount,
        date: editingExpense.date,
      });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount).toFixed(2),
    });

    // Resetear formulario si no estamos editando
    if (!editingExpense) {
      setFormData({
        description: '',
        category: 'comida',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {editingExpense ? (
            <>
              <Save className="w-5 h-5" />
              Editar Gasto
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Agregar Nuevo Gasto
            </>
          )}
        </h2>
        {editingExpense && (
          <button
            onClick={onCancel}
            className="btn-icon"
            aria-label="Cancelar edición"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej: Almuerzo en restaurante"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto ($)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            {editingExpense ? (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Agregar Gasto
              </>
            )}
          </button>
          {editingExpense && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
