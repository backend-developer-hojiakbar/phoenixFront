import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentMagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { LocalizationKeys } from '../../constants';
import apiService from '../../services/apiService';

// Define AuditLog interface inline since it's not in the types file
interface AuditLog {
  id: number;
  timestamp: string;
  user_phone?: string;
  user?: string | number;
  actionType: string;
  targetEntityType?: string;
  targetEntityId?: string | number;
  details: string | Record<string, any>;
}

// Define SelectOption interface inline since it's not in the types file
interface SelectOption {
  value: string | number;
  label: string;
}

const AdminAuditLogPage: React.FC = () => {
    const { translate } = useLanguage();
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterUser, setFilterUser] = useState('');
    const [filterActionType, setFilterActionType] = useState<string>('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.get<AuditLog[]>('/audit-logs/');
                setAuditLogs(response.data);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const actionTypeOptions: SelectOption[] = [
        { value: 'ALL', label: translate('all_action_types') },
        // This should be dynamically populated from backend if possible, or hardcoded
        ...[...new Set(auditLogs.map(log => log.actionType))].map(type => ({
            value: type,
            label: translate(`audit_action_${type.toLowerCase()}`, type.replace(/_/g, ' '))
        }))
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
            if (filterUser && !(log.user_phone?.toLowerCase().includes(filterUser.toLowerCase()) || String(log.user)?.toLowerCase().includes(filterUser.toLowerCase()))) return false;
            if (filterActionType !== 'ALL' && log.actionType !== filterActionType) return false;
            return true;
        }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLogs, filterUser, filterActionType, filterStartDate, filterEndDate]);


    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <DocumentMagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-sky flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-accent-sky">{translate(LocalizationKeys.AUDIT_LOG_TITLE)}</h1>
                </div>
            </div>

            {/* Filter Card */}
            <Card className="admin-card-gradient" title={translate('filter_options_title')} icon={<FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-purple"/>}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                    <div className="admin-form-group">
                      <Input 
                          label={translate(LocalizationKeys.FILTER_BY_USER_LABEL)} 
                          placeholder={translate('user_phone_or_id_placeholder')}
                          value={filterUser} 
                          onChange={e => setFilterUser(e.target.value)} 
                          className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="actionTypeFilter" className="block text-xs sm:text-sm font-medium text-light-text mb-1">
                            {translate(LocalizationKeys.FILTER_BY_ACTION_TYPE_LABEL)}
                        </label>
                        <select 
                            id="actionTypeFilter"
                            value={filterActionType} 
                            onChange={e => setFilterActionType(e.target.value)}
                            className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-700 border border-slate-600 rounded-lg text-light-text focus:ring-accent-sky focus:border-accent-sky text-xs sm:text-sm admin-input"
                        >
                            {actionTypeOptions.map(opt => <option key={opt.value} value={opt.value as string}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="admin-form-group">
                      <Input 
                          type="date"
                          label={translate('start_date_label')} 
                          value={filterStartDate} 
                          onChange={e => setFilterStartDate(e.target.value)}
                          className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <Input 
                          type="date"
                          label={translate('end_date_label')} 
                          value={filterEndDate} 
                          onChange={e => setFilterEndDate(e.target.value)}
                          className="admin-input"
                      />
                    </div>
                </div>
                
                {/* Clear Filters Button */}
                {(filterUser || filterActionType !== 'ALL' || filterStartDate || filterEndDate) && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setFilterUser('');
                        setFilterActionType('ALL');
                        setFilterStartDate('');
                        setFilterEndDate('');
                      }}
                      className="admin-button-secondary"
                    >
                      Filtrlarni tozalash
                    </Button>
                  </div>
                )}
            </Card>
            
            {/* Audit Logs Card */}
            <Card className="admin-card-gradient" title={undefined} icon={undefined}>
                {isLoading ? <LoadingSpinner message={translate('loading_audit_logs')} />
                : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-medium-text mb-4">{translate(LocalizationKeys.NO_AUDIT_LOGS_MESSAGE)}</p>
                        <Button 
                          onClick={() => window.location.reload()} 
                          variant="secondary" 
                          className="admin-button-secondary"
                        >
                          Qayta yuklash
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="min-w-full divide-y divide-slate-700 admin-table">
                            <thead className="admin-table-header">
                                <tr>
                                    <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.TIMESTAMP_LABEL)}</th>
                                    <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.USER_ID_LABEL)}</th>
                                    <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.ACTION_TYPE_LABEL)}</th>
                                    <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate('target_entity_label')}</th>
                                    <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">{translate(LocalizationKeys.DETAILS_LABEL)}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-secondary-dark divide-y divide-slate-700">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm text-medium-text">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm text-medium-text">{log.user_phone || log.user || 'System'}</td>
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm">
                                          <span className="px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-sky-600/30 text-sky-300 admin-status-badge">
                                            {translate(`audit_action_${log.actionType.toLowerCase()}`, log.actionType.replace(/_/g, ' '))}
                                          </span>
                                        </td>
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 whitespace-nowrap text-sm text-medium-text max-w-[120px] sm:max-w-[180px] truncate">
                                            {log.targetEntityType && `${log.targetEntityType} (ID: ${log.targetEntityId || 'N/A'})`}
                                        </td>
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 text-sm text-light-text max-w-[180px] sm:max-w-[250px] truncate">
                                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
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