import React, { useState, useEffect } from 'react';
import { FinancialReport } from '../../types';
import apiService from '../../services/apiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FinancialReportPage: React.FC = () => {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const { data } = await apiService.get<FinancialReport>('/financial-report/');
                setReport(data);
            } catch (err) {
                setError("Hisobotni yuklashda xatolik.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, []);
    
    const handleExport = (format: 'pdf' | 'excel') => {
        window.open(`${apiService.defaults.baseURL}/financial-report/?format=${format}`, '_blank');
    };

    const chartData = {
        labels: report?.monthly_revenue.map(r => new Date(r.month).toLocaleString('default', { month: 'short', year: 'numeric' })) || [],
        datasets: [{
            label: 'Oylik Daromad (UZS)',
            data: report?.monthly_revenue.map(r => r.total) || [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    if (isLoading) return <LoadingSpinner message="Hisobot yuklanmoqda..." />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-accent-sky">Moliyaviy Hisobot</h1>
                <div className="space-x-2">
                    <Button onClick={() => handleExport('pdf')} leftIcon={<DocumentArrowDownIcon className="h-5"/>}>PDF yuklash</Button>
                    <Button onClick={() => handleExport('excel')} leftIcon={<DocumentArrowDownIcon className="h-5"/>}>Excel yuklash</Button>
                </div>
            </div>
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            
            <Card title="Oylik Daromadlar Diagrammasi">
                {report && <Line data={chartData} />}
            </Card>

            <Card title="Tasdiqlangan Maqolalar Tarixi">
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Sarlavha</th>
                                <th className="px-4 py-3 text-left">Muallif</th>
                                <th className="px-4 py-3 text-left">Jurnal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-secondary-dark divide-y divide-slate-700">
                            {report?.approved_articles_history.map(article => (
                                <tr key={article.id}>
                                    <td className="px-4 py-4">{article.id}</td>
                                    <td className="px-4 py-4">{article.title}</td>
                                    <td className="px-4 py-4">{article.author.name} {article.author.surname}</td>
                                    <td className="px-4 py-4">{article.journalName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinancialReportPage;