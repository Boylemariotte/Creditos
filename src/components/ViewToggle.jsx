import { Users, User } from 'lucide-react';

const ViewToggle = ({ mode, setMode }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm inline-flex mb-6">
            <button
                onClick={() => setMode('personal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'personal'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                <User className="w-4 h-4" />
                Personal
            </button>
            <button
                onClick={() => setMode('joint')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'joint'
                        ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                <Users className="w-4 h-4" />
                Pareja
            </button>
        </div>
    );
};

export default ViewToggle;
