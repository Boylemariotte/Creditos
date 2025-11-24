import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, DollarSign, Heart, Activity } from 'lucide-react';
import { formatCurrency } from '../utils/storage';
import API_URL from '../config';

const ProfilePage = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar perfil');

            const data = await response.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                                    <User className="w-16 h-16 text-gray-600 dark:text-gray-300" />
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">@{profile.username || 'sin_usuario'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            Información Personal
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Mail className="w-5 h-5" />
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Calendar className="w-5 h-5" />
                                <span>Miembro desde {new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            Estadísticas
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.expenseCount}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(profile.stats.totalExpenses)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partner Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Pareja
                    </h2>
                    {profile.partner ? (
                        <div className="flex items-center gap-4 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                            <div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-full">
                                <User className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{profile.partner.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.partner.username}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Vinculado
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes una pareja vinculada aún.</p>
                            <a href="/couples" className="text-primary-600 hover:text-primary-500 font-medium">
                                Ir a vincular pareja &rarr;
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
