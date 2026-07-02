import FormularioReserva from './components/FormularioReserva';
import CancelarReserva from './components/CancelarReserva';
import { useState, useEffect } from 'react';
import VistaConserje from './components/VistaConserje';
import GestionAdmin from './components/GestionAdmin';
import ReportesAdmin from './components/ReportesAdmin';
import BloqueosAdmin from './components/BloqueosAdmin';
import HistorialReservas from './components/HistorialReservas';
import Login from './components/Login';


function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('residente'); //estado para controlar qué vista renderizar

  useEffect(() => {
    //Verificar si el usuario ya tenía una sesión activa al cargar la página
    const sesionGuardada = sessionStorage.getItem('usuarioLogueado');
    if (sesionGuardada) {
      setUsuario(JSON.parse(sesionGuardada));
    }
  }, []);

  const handleCerrarSesion = () => {
    sessionStorage.removeItem('usuarioLogueado');
    setUsuario(null);
  };

  //Si no está autenticado, directo al Login
  if (!usuario) {
    return <Login alLoguear={(u) => setUsuario(u)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar superior */}
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='text-xl font-black tracking-wider text-slate-900 uppercase'>
            Portal de Reservas
          </span>
          {/* Indicador visual del departamento logueado */}
          <span className='text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md border border-slate-200'>
            Depto. {usuario.departamento}
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <button
            onClick={() => setVistaActual('residente')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition duration-150 ${
              vistaActual === 'residente'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reservar
          </button>

          <button
            onClick={() => setVistaActual('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition duration-150 ${
              vistaActual === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Administrador / Conserje
          </button>

          {/* Botón para salir de forma segura */}
          <button
            onClick={handleCerrarSesion}
            className="ml-2 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition duration-150"
            title="Cerrar sesión activa"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className='py-10 px-4 max-w-4xl mx-auto'>
        {vistaActual === 'residente' ? (
          <div className='space-y-8 animate-fade-in'>
            <header className='text-center mb-2'>
              <h1 className='text-2xl font-extrabold text-gray-900'>Portal del Residente</h1>
              <p className='text-gray-600 text-xs'>
                Bienvenido/a, <span className="font-semibold text-gray-800">{usuario.nombre}</span> — Gestiona tus bloques de uso de espacios comunes
              </p>
            </header>

            <FormularioReserva />
            {/* Insertamos el Historial de Reservas personal */}
            <HistorialReservas />
            <CancelarReserva />
          </div>
        ) : (
          <div className='space-y-8 animate-fade-in'>
            <VistaConserje />
            <GestionAdmin />
            <ReportesAdmin />
            <BloqueosAdmin />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
