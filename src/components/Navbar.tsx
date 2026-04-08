import { Search, LogOut, Users } from 'lucide-react';

interface NavbarProps {
  onOpenTournaments: () => void;
  onOpenPlayers: () => void;
  onOpenImport: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({ onOpenTournaments, onOpenPlayers, onOpenImport, onOpenLogin, isLoggedIn, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm">
              <img 
                src="https://lbx.org.br/wp-content/uploads/2023/03/LBX-logo.png" 
                alt="LBX Logo" 
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#000829]">LBX</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-semibold text-slate-900 border-b-2 border-yellow-400 pb-1">Home</a>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onOpenTournaments();
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Torneios
            </button>
            {isLoggedIn && (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPlayers();
                  }}
                  className="text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Users size={16} />
                  Jogadores
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenImport();
                  }}
                  className="text-sm font-bold text-green-700 hover:text-green-600 transition-colors flex items-center gap-1.5"
                >
                  <Search size={16} />
                  Importar
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-600 hover:text-slate-900">
              <Search size={20} />
            </button>
            {isLoggedIn ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors font-bold text-sm"
              >
                Sair
                <LogOut size={18} />
              </button>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="bg-[#000829] text-white px-8 py-2.5 rounded-md text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
