import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { UserTask, CalendarEvent, Article } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarDaysIcon, PlusCircleIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';

const CalendarPage: React.FC = () => {
    const { translate } = useLanguage();
    const { user } = useAuth();

    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [userArticles, setUserArticles] = useState<Article[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<UserTask | null>(null);
    const [taskFormData, setTaskFormData] = useState<Partial<UserTask>>({ description: '', dueDate: new Date().toISOString().split('T')[0], isCompleted: false });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load tasks from localStorage and fetch articles from API
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            // Load tasks from localStorage
            const storedTasks = localStorage.getItem(`userTasks_${user.id}`);
            if (storedTasks) {
                try {
                    setTasks(JSON.parse(storedTasks));
                } catch {
                    setTasks([]);
                }
            }

            // Fetch user's articles for linking
            const fetchArticles = async () => {
                try {
                    const response = await apiService.get<Article[]>('/articles/');
                    setUserArticles(response.data);
                } catch (error) {
                    console.error("Failed to fetch articles for calendar", error);
                }
            };
            
            fetchArticles();

            // Mock system-generated calendar events (deadlines, etc.)
            const mockDeadlines: CalendarEvent[] = [
                { id: 'deadline1', title: `${translate(LocalizationKeys.ARTICLE_DEADLINE_EVENT)}: 'New Research' uchun annotatsiya`, date: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split('T')[0], type: 'deadline', color: 'red' },
                { id: 'deadline2', title: `${translate(LocalizationKeys.ARTICLE_DEADLINE_EVENT)}: 'AI Ethics' uchun tahrirlash`, date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().split('T')[0], type: 'deadline', color: 'amber' },
            ];
            setCalendarEvents(mockDeadlines);
            setIsLoading(false);
        }
    }, [user, translate]);

    // Update calendar events view whenever tasks change
    useEffect(() => {
        const taskEvents: CalendarEvent[] = tasks.map(task => ({
            id: `task-${task.id}`,
            title: task.description || '',
            date: task.dueDate || '',
            type: 'user_task',
            color: task.isCompleted ? 'emerald' : 'sky',
        }));
        // Keep existing non-task events and update with the new list of task events
        setCalendarEvents(prevEvents => [...prevEvents.filter(e => e.type !== 'user_task'), ...taskEvents]);
    }, [tasks]);


    const saveTasksToLocalStorage = (updatedTasks: UserTask[]) => {
        if (user) {
            localStorage.setItem(`userTasks_${user.id}`, JSON.stringify(updatedTasks));
            setTasks(updatedTasks);
        }
    };

    const handleOpenModal = (task: UserTask | null = null) => {
        setEditingTask(task);
        setTaskFormData(task ? { ...task } : { description: '', dueDate: new Date().toISOString().split('T')[0], isCompleted: false, articleId: '' });
        setIsModalOpen(true);
        setMessage(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setTaskFormData({ ...taskFormData, [e.target.name]: e.target.value });
    };

    const handleSaveTask = () => {
        if (!user || !taskFormData.description || !taskFormData.dueDate) {
            setMessage({ type: 'error', text: 'Tavsif va bajarish muddati kiritilishi shart.' });
            return;
        }

        let updatedTasks;
        if (editingTask) {
            updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskFormData } as UserTask : t);
            setMessage({ type: 'success', text: translate(LocalizationKeys.TASK_SAVED_SUCCESS) });
        } else {
            const newTask: UserTask = {
                id: `task-${Date.now()}`,
                userId: user.id,
                createdAt: new Date().toISOString(),
                isCompleted: false,
                ...taskFormData,
            } as UserTask;
            updatedTasks = [...tasks, newTask];
            setMessage({ type: 'success', text: translate(LocalizationKeys.TASK_SAVED_SUCCESS) });
        }
        saveTasksToLocalStorage(updatedTasks);
        handleCloseModal();
    };

    const handleToggleTaskComplete = (taskId: string) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        saveTasksToLocalStorage(updatedTasks);
        const task = updatedTasks.find(t=>t.id === taskId);
        setMessage({ type: 'success', text: task?.isCompleted ? translate(LocalizationKeys.TASK_COMPLETED_SUCCESS) : translate(LocalizationKeys.TASK_INCOMPLETE_SUCCESS) });
    };
    
    const handleDeleteTask = (taskId: string) => {
        if(window.confirm(translate(LocalizationKeys.CONFIRM_DELETE_TASK_PROMPT))) {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            saveTasksToLocalStorage(updatedTasks);
            setMessage({ type: 'success', text: translate(LocalizationKeys.TASK_DELETED_SUCCESS) });
        }
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = daysInMonth(year, month);
        let firstDay = firstDayOfMonth(year, month);
        if (firstDay === 0) firstDay = 7; // Sunday is 0, make it 7
        firstDay -= 1; // Adjust to start from Monday
        
        const today = new Date();

        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="border border-slate-700 p-2 h-24"></div>);
        }

        for (let day = 1; day <= numDays; day++) {
            const cellDate = new Date(year, month, day);
            const cellDateString = cellDate.toISOString().split('T')[0];
            const dayEvents = calendarEvents.filter(event => event.date === cellDateString);
            const isToday = cellDate.toDateString() === today.toDateString();

            cells.push(
                <div key={day} className={`border border-slate-700 p-2 h-28 flex flex-col relative ${isToday ? 'bg-slate-700/50' : ''}`}>
                    <span className={`font-medium text-right ${isToday ? 'text-accent-sky' : 'text-light-text'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5 overflow-y-auto max-h-20 text-xs">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`p-1 rounded truncate ${
                                event.color === 'red' ? 'bg-red-500/30 text-red-200' :
                                event.color === 'amber' ? 'bg-amber-500/30 text-amber-200' :
                                event.color === 'emerald' ? 'bg-emerald-500/30 text-emerald-200' :
                                'bg-sky-500/30 text-sky-200'
                            }`} title={event.title}>
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return cells;
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const weekDays = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-accent-sky flex items-center">
                    <CalendarDaysIcon className="h-8 w-8 mr-2" />
                    {translate(LocalizationKeys.CALENDAR_PAGE_TITLE)}
                </h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
                    {translate(LocalizationKeys.ADD_NEW_TASK_BUTTON)}
                </Button>
            </div>

            {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} className="mb-4" />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title={`${currentDate.toLocaleString(undefined, { month: 'long' })} ${currentDate.getFullYear()}`} className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <Button onClick={() => changeMonth(-1)} variant="ghost" size="sm" leftIcon={<ChevronLeftIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.MONTH_PREVIOUS)}</Button>
                        <Button onClick={() => changeMonth(1)} variant="ghost" size="sm" rightIcon={<ChevronRightIcon className="h-5 w-5"/>}>{translate(LocalizationKeys.MONTH_NEXT)}</Button>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-700">
                        {weekDays.map(day => (
                            <div key={day} className="text-center font-semibold text-xs text-medium-text py-2 border-b border-slate-700">{day}</div>
                        ))}
                        {renderCalendarGrid()}
                    </div>
                </Card>

                <Card title={translate(LocalizationKeys.TASK_LIST_TITLE)}>
                    {isLoading && <LoadingSpinner size="sm" />}
                    {!isLoading && tasks.length === 0 && (
                        <p className="text-sm text-medium-text">{translate(LocalizationKeys.NO_TASKS_MESSAGE)}</p>
                    )}
                    <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {tasks.filter(t => !t.isCompleted).sort((a,b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()).map(task => (
                            <li key={task.id} className="p-3 bg-slate-700/50 rounded-lg flex items-start justify-between">
                                <div className="flex items-start">
                                    <input 
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={() => handleToggleTaskComplete(task.id)}
                                        className="form-checkbox h-5 w-5 text-accent-emerald bg-slate-600 border-slate-500 rounded focus:ring-accent-emerald mr-3 mt-1 flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-light-text">{task.description}</p>
                                        <p className="text-xs text-slate-400">
                                            {translate(LocalizationKeys.DUE_DATE_LABEL)}: {new Date(task.dueDate || '').toLocaleDateString()}
                                            {task.articleId && userArticles.find(a=>a.id === Number(task.articleId)) && 
                                                <span className="ml-2 text-sky-400">({userArticles.find(a=>a.id === Number(task.articleId))?.title.substring(0,20)}...)</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 space-x-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(task)}><PencilIcon className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4"/></Button>
                                </div>
                            </li>
                        ))}
                         {tasks.filter(t => t.isCompleted).length > 0 && (
                            <li className="pt-3 mt-3 border-t border-slate-700">
                                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Bajarilgan vazifalar</h4>
                                {tasks.filter(t => t.isCompleted).map(task => (
                                     <li key={task.id} className="p-3 bg-slate-800/30 rounded-lg flex items-start justify-between opacity-70 mb-2">
                                        <div className="flex items-start">
                                            <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleTaskComplete(task.id)} className="form-checkbox h-5 w-5 text-accent-emerald bg-slate-600 border-slate-500 rounded focus:ring-accent-emerald mr-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium line-through text-slate-500">{task.description}</p>
                                                <p className="text-xs text-slate-500">{translate(LocalizationKeys.DUE_DATE_LABEL)}: {new Date(task.dueDate || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                         <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-red-500/70 hover:text-red-400"><TrashIcon className="h-4 w-4"/></Button>
                                    </li>
                                ))}
                            </li>
                        )}
                    </ul>
                </Card>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={editingTask ? translate(LocalizationKeys.TASK_MODAL_TITLE_EDIT) : translate(LocalizationKeys.TASK_MODAL_TITLE_ADD)}
            >
                <Textarea
                    label={translate(LocalizationKeys.TASK_DESCRIPTION_LABEL)}
                    name="description"
                    value={taskFormData.description || ''}
                    onChange={handleTaskFormChange}
                    rows={3}
                    required
                />
                <Input
                    label={translate(LocalizationKeys.DUE_DATE_LABEL)}
                    type="date"
                    name="dueDate"
                    value={taskFormData.dueDate || ''}
                    onChange={handleTaskFormChange}
                    required
                />
                <div className="mb-4">
                    <label htmlFor="articleId" className="block text-sm font-medium text-light-text mb-1">{translate(LocalizationKeys.RELATED_ARTICLE_LABEL)}</label>
                    <select
                        id="articleId"
                        name="articleId"
                        value={taskFormData.articleId || ''}
                        onChange={handleTaskFormChange}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-2 focus:ring-accent-sky focus:border-accent-sky focus:outline-none"
                    >
                        <option value="">-- {translate('select_an_article_optional')} --</option>
                        {userArticles.map(article => (
                            <option key={article.id} value={article.id}>{article.title}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" onClick={handleCloseModal}>{translate('cancel_button')}</Button>
                    <Button onClick={handleSaveTask} isLoading={isLoading}>{translate(LocalizationKeys.SAVE_TASK_BUTTON)}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default CalendarPage;