import { useState, useEffect } from 'react';

interface DateNavigatorProps {
    currentDate: string;
    onDateChange: (date: string) => void;
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
    const [showCalendar, setShowCalendar] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const date = new Date(currentDate);
        if (direction === 'prev') {
            date.setDate(date.getDate() - 1);
        } else {
            date.setDate(date.getDate() + 1);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onDateChange(`${year}-${month}-${day}`);
    };

    const goToToday = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        onDateChange(today);
    };

    const isToday = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        return currentDate === today;
    })();

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between">
                {/* Date Display */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">📅</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {formatDate(currentDate)}
                            </h2>
                            {isToday && (
                                <span className="text-sm text-emerald-600 font-medium">Today</span>
                            )}
                        </div>
                    </div>
                    {!isToday && (
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-medium hover:from-blue-200 hover:to-blue-300 transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                        >
                            Go to Today
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="px-2 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                        title="Previous day"
                    >
                        <span className="text-lg">←</span>
                    </button>

                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                    >
                        <span className="mr-2">📅</span>
                        Calendar
                    </button>

                    <button
                        onClick={() => navigateDate('next')}
                        className="px-2 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                        title="Next day"
                    >
                        <span className="text-lg">→</span>
                    </button>
                </div>
            </div>

            {/* Calendar */}
            {showCalendar && (
                <div className="mt-6 p-6 border-t border-gray-200/50">
                    <Calendar
                        selectedDate={currentDate}
                        onDateSelect={(date) => {
                            onDateChange(date);
                            setShowCalendar(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

// Simple Calendar Component
function Calendar({ selectedDate, onDateSelect }: { selectedDate: string; onDateSelect: (date: string) => void }) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Update currentMonth when selectedDate changes
    useEffect(() => {
        setCurrentMonth(new Date(selectedDate));
    }, [selectedDate]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const isToday = (day: number) => {
        const date = new Date(year, month, day);
        const now = new Date();
        const todayYear = now.getFullYear();
        const todayMonth = now.getMonth();
        const todayDay = now.getDate();
        return date.getFullYear() === todayYear && date.getMonth() === todayMonth && date.getDate() === todayDay;
    };

    const isSelected = (day: number) => {
        const date = new Date(year, month, day);
        return date.toISOString().split('T')[0] === selectedDate;
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        const dateYear = date.getFullYear();
        const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
        const dateDay = String(date.getDate()).padStart(2, '0');
        onDateSelect(`${dateYear}-${dateMonth}-${dateDay}`);
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:scale-105"
                    title="Previous month"
                >
                    <span className="text-lg">←</span>
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>

                <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:scale-105"
                    title="Next month"
                >
                    <span className="text-lg">→</span>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                        {day}
                    </div>
                ))}

                {days.map((day, index) => (
                    <div key={index} className="text-center">
                        {day ? (
                            <button
                                onClick={() => handleDateClick(day)}
                                className={`
                  w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isSelected(day)
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-110'
                                        : isToday(day)
                                            ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 hover:from-emerald-200 hover:to-emerald-300 hover:scale-105 shadow-md'
                                            : 'hover:bg-gray-100 hover:scale-105 text-gray-700'
                                    }
                `}
                            >
                                {day}
                            </button>
                        ) : (
                            <div className="w-10 h-10" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
