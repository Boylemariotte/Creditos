import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Check, X, Search, Heart, Clock } from 'lucide-react';

const CouplesPage = () => {
    const { user, searchUser, sendLinkRequest, getRequests, respondToRequest } = useAuth();
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        setSearchResult(null);

        try {
            const result = await searchUser(searchUsername);
            setSearchResult(result);
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!searchResult) return;
        setLoading(true);
        try {
            await sendLinkRequest(searchResult.id);
            setStatus({ type: 'success', message: 'Solicitud enviada correctamente' });
            setSearchResult(null);
            setSearchUsername('');
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, action) => {
        try {
            const result = await respondToRequest(requestId, action);
            if (action === 'accept') {
                setStatus({ type: 'success', message: `¡Conectado con éxito con ${result.partnerName}!` });
            } else {
                setStatus({ type: 'info', message: 'Solicitud rechazada' });
            }
            loadRequests();
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="bg-pink-100 p-3 rounded-full">
                            <Heart className="w-8 h-8 text-pink-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Modo Pareja
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Vincula tu cuenta con tu pareja para ver gastos compartidos y comparar finanzas.
                    </p>
                </div>

                {user?.partnerId ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-green-100 p-4 rounded-full">
                                <Check className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            ¡Estás conectado!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Tu cuenta está vinculada exitosamente. Ahora puedes ver los gastos compartidos en el Dashboard.
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                            Vinculado con {user.partnerName || 'tu pareja'}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Search Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Buscar Pareja
                            </h3>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Buscar por nombre de usuario..."
                                        value={searchUsername}
                                        onChange={(e) => setSearchUsername(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    Buscar
                                </button>
                            </form>

                            {status.message && (
                                <div className={`mt-4 p-3 rounded-md ${status.type === 'error' ? 'bg-red-50 text-red-700' :
                                        status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            {searchResult && (
                                <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary-100 p-2 rounded-full">
                                            <UserPlus className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{searchResult.name}</p>
                                            <p className="text-sm text-gray-500">@{searchResult.username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendRequest}
                                        disabled={loading}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                                    >
                                        Enviar Solicitud
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Pending Requests */}
                        {requests.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Solicitudes Pendientes
                                </h3>
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div key={req.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {req.sender.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    @{req.sender.username} quiere vincularse contigo
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRespond(req.id, 'accept')}
                                                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                                    title="Aceptar"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(req.id, 'reject')}
                                                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                                    title="Rechazar"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouplesPage;
