import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, change, trend, icon: Icon, colorClass }) {
    const isPositive = trend === 'up';

    return (
        <div className="card-turf p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                    <Icon className={`w-6 h-6 file:${colorClass.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
