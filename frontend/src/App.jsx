import FormularioReserva from './components/FormularioReserva';
import CancelarReserva from './components/CancelarReserva';
import { useState } from 'react';
import VistaConserje from './components/VistaConserje';
import GestionAdmin from './components/GestionAdmin';


function App() {
  const [vistaActual, setVistaActual] = useState('residente'); //estado para controlar qué vista renderizar

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar superior */}
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-xl font-black tracking-wider text-slate-900 uppercase'>
            Portal de Reservas
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <button
            onClick={() => setVistaActual('residente')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition duration-150 ${
              vistaActual === 'residente'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reservar
          </button>

          <button
            onClick={() => setVistaActual('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition duration-150 ${
              vistaActual === 'admin'
                ? 'bg-amber-500 text-slate-950'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'

            }`}
          >Administrador / Conserje</button>
        </div>
      </nav>

      <main className='py-10 px-4 max-w-4xl mx-auto'>
        {vistaActual === 'residente' ? (
          <div className='space-y-8 animate-fade-in'>
            <header className='text-center mb-2'>
              <h1 className='text-2xl font-extrabold text-gray-900'>Portal del Residente</h1>
              <p className='text-gray-600 text-xs'>Gestiona tus bloques de uso de espacios comunes</p>
            </header>

            <FormularioReserva />
            <CancelarReserva />
          </div>
        ) : (
          <div className='animate-fade-in'>
            <VistaConserje />
            <GestionAdmin />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
