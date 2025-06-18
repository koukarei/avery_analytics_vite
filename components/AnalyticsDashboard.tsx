import React from 'react';
import type { WritingMistake } from '../types/studentWork';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useLocalization } from '../contexts/localizationUtils';

interface AnalyticsDashboardProps {
  mistakes: WritingMistake[];
}

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#6366f1', '#d946ef', '#f97316'];


const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ mistakes }) => {
  const { t } = useLocalization();

  if (mistakes.length === 0) {
    return <p className="text-slate-500">{t('analyticsDashboard.noData')}</p>;
  }

  // Mistake names (m.mistake) are from mock data and will appear in English
  const chartData = mistakes.map(m => ({
    name: m.mistake, // This label will appear in the chart as is from the data
    frequency: m.frequency,
    category: t(`mistakeCategories.${m.categoryKey}`), // Tooltip can show translated category
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h3 className="text-2xl font-semibold text-primary mb-6 text-center">{t('analyticsDashboard.title')}</h3>
      <div className="w-full h-96 md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 150, 
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" stroke="#475569" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150} 
              tick={{fontSize: 12, fill: '#475569'}} 
              interval={0} 
            />
            <Tooltip 
              cursor={{fill: 'rgba(200,200,200,0.2)'}}
              contentStyle={{backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#cbd5e1'}}
              formatter={(value: number, name: string, props: any) => {
                // 'name' here is "frequency". 'props.payload.name' is the mistake name.
                // 'props.payload.category' is the translated category name.
                return [value, t('analyticsDashboard.legend.frequency')];
              }}
              labelFormatter={(label: string, payload: any[]) => {
                 // label is the mistake name from data (m.mistake)
                 if (payload && payload.length > 0 && payload[0].payload.category) {
                    return `${label} (${payload[0].payload.category})`;
                 }
                 return label;
              }}
            />
            <Legend 
              wrapperStyle={{paddingTop: '20px'}}
              formatter={(value, entry, index) => t('analyticsDashboard.legend.frequency')}
            />
            <Bar dataKey="frequency" name={t('analyticsDashboard.legend.frequency')} radius={[0, 5, 5, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
