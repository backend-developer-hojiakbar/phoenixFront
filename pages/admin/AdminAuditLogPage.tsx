import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentMagnifyingGlassIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { AuditLogEntry, AuditActionType, SelectOption } from '../../types';
import { LocalizationKeys } from '../../constants';
import { api } from '../../services/api';

const AdminAuditLogPage: React.FC = () => {
    const { translate } = useLanguage();
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterUser, setFilterUser] = useState('');
    const [filterActionType, setFilterActionType] = useState<AuditActionType | 'ALL'>('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        setIsLoading(true);
        api.get('/audit-logs/')
            .then(data => {
                setAuditLogs(data);
            })
            .catch(err => {
                console.error("Failed to load audit logs:", err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const actionTypeOptions: SelectOption[] = [
        { value: 'ALL', label: translate('all_action_types') },
        ...Object.values(AuditActionType).map(type => ({ value: type, label: translate(`audit_action_${type.toLowerCase()}`, type.replace(/_/g, ' ')) }))
    ];
    
    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            const startDate = filterStartDate ? new Date(filterStartDate) : null;
            const endDate = filterEndDate ? new Date(filterEndDate) : null;
            if (startDate && logDate < startDate) return false;
            if (endDate) {
                 const endOfDay = new Date(endDate);
                 endOfDay.setHours(23,59,59,999);
                 if (logDate > endOfDay) return false;
            }
            if (filterUser && !(log.userEmail?.toLowerCase().includes(filterUser.toLowerCase()) || log.userId?.includes(filterUser))) return false;
            if (filterActionType !== 'ALL' && log.actionType !== filterActionType) return false;
            return true;
        });
    }, [auditLogs, filterUser, filterActionType, filterStartDate, filterEndDate]);

    const handleExportLogs = () => {
        alert(translate(LocalizationKeys.AUDIT_LOG_EXPORTED_MESSAGE));
    };

    if (isLoading && auditLogs.length === 0) {
        return <LoadingSpinner message={translate('loading_audit_logs')} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <DocumentMagnifyingGlassIcon className="h-8 w-8 text-accent-sky" />
                <h1 className="text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.AUDIT_LOG_TITLE)}</h1>
            </div>

            <Card title={translate('filter_options_title')} icon={<FunnelIcon className="h-5 w-5 text-accent-purple"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Input 
                        label={translate(LocalizationKeys.FILTER_BY_USER_LABEL)} 
                        placeholder={translate('user_email_or_id_placeholder')}
                        value={filterUser} 
                        onChange={e => setFilterUser(e.target.value)} 
                    />
                    <div>
                        <label htmlFor="actionTypeFilter" className="block text-sm font-medium text-light-text mb-1">
                            {translate(LocalizationKeys.FILTER_BY_ACTION_TYPE_LABEL)}
                        </label>
                        <select 
                            id="actionTypeFilter"
                            value={filterActionType} 
                            onChange={e => setFilterActionType(e.target.value as AuditActionType | 'ALL')}
                            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-light-text text-sm"
                        >
                            {actionTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <Input 
                        type="date"
                        label={translate('start_date_label')} 
                        value={filterStartDate} 
                        onChange={e => setFilterStartDate(e.target.value)}
                    />
                     <Input 
                        type="date"
                        label={translate('end_date_label')} 
                        value={filterEndDate} 
                        onChange={e => setFilterEndDate(e.target.value)}
                    />
                </div>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleExportLogs} leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>
                    {translate(LocalizationKeys.EXPORT_AUDIT_LOG_BUTTON)}
                </Button>
            </div>
            
            <Card>
                {isLoading ? <LoadingSpinner message={translate('loading_audit_logs')} /> :
                 !filteredLogs.length ? (
                    <p className="text-center text-medium-text py-8">{translate(LocalizationKeys.NO_AUDIT_LOGS_MESSAGE)}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.TIMESTAMP_LABEL)}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.USER_ID_LABEL)}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.ACTION_TYPE_LABEL)}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">{translate(LocalizationKeys.DETAILS_LABEL)}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-700/50">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-medium-text">{log.userEmail || log.userId || 'System'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-600/30 text-sky-300">
                                            {translate(`audit_action_${log.actionType.toLowerCase()}`, log.actionType.replace(/_/g, ' '))}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-light-text">
                                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminAuditLogPage;