import { Trash2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/storage';

const IncomeList = ({ incomes, onDelete }) => {
    if (!incomes.length) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay ingresos registrados</h3>
                <p className="text-gray-500 dark:text-gray-400">Comienza agregando tus fuentes de ingreso.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {incomes.map((income) => (
                <div
                    key={income.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {income.source}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {new Date(income.date).toLocaleDateString()}
                                </span>
                            </div>
                            {income.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{income.description}</p>
                            )}
                            {income.user && (
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                    Registrado por: {income.user.name}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                +{formatCurrency(income.amount)}
                            </span>
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(income.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Eliminar ingreso"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IncomeList;
