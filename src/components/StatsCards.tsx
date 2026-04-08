import { Clock, Users, Trophy } from 'lucide-react';
import { StatCard } from '../types';
import { motion } from 'motion/react';

const iconMap = {
  clock: Clock,
  users: Users,
  trophy: Trophy,
};

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon as keyof typeof iconMap];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-5"
            >
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-widest mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-[#000829]">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

