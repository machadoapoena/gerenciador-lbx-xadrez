import { Share2, Globe, Megaphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#000829] py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-800">
              <img 
                src="https://lbx.org.br/wp-content/uploads/2023/03/LBX-logo.png" 
                alt="LBX Logo" 
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Liga Brasileira de Xadrez</span>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-8">
              <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Contato</a>
            </div>
            
            <div className="flex items-center gap-6 text-yellow-400">
              <button className="hover:text-yellow-300 transition-colors"><Share2 size={18} /></button>
              <button className="hover:text-yellow-300 transition-colors"><Globe size={18} /></button>
              <button className="hover:text-yellow-300 transition-colors"><Megaphone size={18} /></button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © 2026 LIGA BRASILEIRA DE XADREZ. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  );
}
