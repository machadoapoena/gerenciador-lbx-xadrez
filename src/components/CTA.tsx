import { motion } from 'motion/react';

export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="bg-[#000829] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}></div>
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Quer figurar neste ranking?</h2>
          <p className="text-slate-400 font-medium">Participe dos próximos torneios oficiais e suba no quadro estadual.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-yellow-400 text-[#000829] px-10 py-4 rounded-xl font-black text-sm uppercase tracking-tight shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition-colors relative z-10"
        >
          PARTICIPE DOS PRÓXIMOS TORNEIOS
        </motion.button>
      </div>
    </section>
  );
}
