import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="bg-[#000829] py-20 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Classificação <span className="text-yellow-400">DF/Entorno</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
            O ranking oficial de excelência da LBX. Acompanhe a pontuação, e o desempenho dos enxadristas na temporada 2026.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
