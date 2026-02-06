'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnalyticsPromotor, AnalyticsEvento } from '@/services/admin';

interface DashboardChartsProps {
    promotorAnalytics: AnalyticsPromotor[];
    eventoAnalytics: AnalyticsEvento[];
}

export default function DashboardCharts({ promotorAnalytics, eventoAnalytics }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Promotor Performance Chart */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Rendimiento por Promotor</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={promotorAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="nombre" stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            labelStyle={{ color: '#ffffff' }}
                        />
                        <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12 }} />
                        <Bar dataKey="totalCodigos" fill="#8b5cf6" name="Total Códigos" />
                        <Bar dataKey="canjeados" fill="#10b981" name="Canjeados" />
                        <Bar dataKey="validados" fill="#3b82f6" name="Validados" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Event Timeline Chart */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Tendencia de Validaciones</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventoAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                            dataKey="fecha"
                            stroke="#ffffff80"
                            tick={{ fill: '#ffffff80', fontSize: 12 }}
                            tickFormatter={(value) => {
                                try {
                                    return format(new Date(value), 'dd/MM', { locale: es });
                                } catch {
                                    return value;
                                }
                            }}
                        />
                        <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                            labelStyle={{ color: '#ffffff' }}
                            labelFormatter={(value) => {
                                try {
                                    return format(new Date(value), 'dd MMMM yyyy', { locale: es });
                                } catch {
                                    return value;
                                }
                            }}
                        />
                        <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12 }} />
                        <Line type="monotone" dataKey="canjeados" stroke="#10b981" strokeWidth={2} name="Canjeados" />
                        <Line type="monotone" dataKey="validados" stroke="#3b82f6" strokeWidth={2} name="Validados" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
