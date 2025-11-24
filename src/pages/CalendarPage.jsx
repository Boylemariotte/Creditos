import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { getEvents, addEvent, deleteEvent } from '../utils/storage';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', type: 'payment' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const loadedEvents = await getEvents();
            setEvents(loadedEvents);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setShowModal(true);
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !selectedDate) return;

        try {
            await addEvent({
                ...newEvent,
                date: selectedDate.toISOString(),
            });
            setShowModal(false);
            setNewEvent({ title: '', description: '', type: 'payment' });
            loadEvents();
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este evento?')) {
            try {
                await deleteEvent(id);
                loadEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const getEventsForDay = (day) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-8 h-8 text-primary-600" />
                        Calendario de Pagos
                    </h1>

                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Calendar Grid Header */}
                    <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid Body */}
                    <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-gray-800">
                        {/* Empty cells for days before first day of month */}
                        {Array.from({ length: firstDay }).map((_, index) => (
                            <div key={`empty-${index}`} className="h-32 border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: days }).map((_, index) => {
                            const day = index + 1;
                            const dayEvents = getEventsForDay(day);
                            const isToday =
                                day === new Date().getDate() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                currentDate.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`h-32 border-b border-r border-gray-100 dark:border-gray-700 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative group ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-full">
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)] custom-scrollbar">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`text-xs p-1.5 rounded border-l-2 truncate group/event relative ${event.type === 'payment'
                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                                                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                                    }`}
                                                title={event.title}
                                            >
                                                {event.title}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvent(event.id);
                                                    }}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/event:opacity-100 p-0.5 hover:bg-white/50 rounded text-red-600"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add button on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                        <div className="bg-primary-600 text-white p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-200">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-600" />
                            Nuevo Recordatorio
                            <span className="text-sm font-normal text-gray-500 ml-auto">
                                {selectedDate?.toLocaleDateString()}
                            </span>
                        </h2>

                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="input-field"
                                    placeholder="Ej: Pagar tarjeta de crédito"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="payment">Pago / Vencimiento</option>
                                    <option value="reminder">Recordatorio General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="input-field min-h-[80px]"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
