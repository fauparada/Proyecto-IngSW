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
  const [vistaActual, setVistaActual] = useState('residente'); 

  useEffect(() => {
    // Verificar si el usuario ya tenía una sesión activa al cargar la página
    const sesionGuardada = sessionStorage.getItem('usuarioLogueado');
    if (sesionGuardada) {
      const usuarioData = JSON.parse(sesionGuardada);
      setUsuario(usuarioData);
      
      // 🚀 ENRUTAMIENTO INICIAL: Si es admin, forzamos su entrada directa a la vista de gestión
      if (usuarioData?.rol === 'admin') {
        setVistaActual('admin');
      } else {
        setVistaActual('residente');
      }
    }
  }, []);

  const handleLoginExitoso = (usuarioLogueado) => {
    setUsuario(usuarioLogueado);
    
    // 🚀 ENRUTAMIENTO EN CALIENTE: Redirige al instante de rellenar el formulario de Login
    if (usuarioLogueado?.rol === 'admin') {
      setVistaActual('admin');
    } else {
      setVistaActual('residente');
    }
  };

  const handleCerrarSesion = () => {
    sessionStorage.removeItem('usuarioLogueado');
    setUsuario(null);
    setVistaActual('residente'); 
  };

  // Si no está autenticado, directo al Login
  if (!usuario) {
    return <Login alLoguear={handleLoginExitoso} />;
  }

  const esAdministrador = usuario?.rol === 'admin';

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
          {/* Tag visual de Rol */}
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
            esAdministrador ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {usuario?.rol}
          </span>
        </div>

        <div className='flex items-center gap-4'>
          {/* 💡 UX/UI REFINADO: Se eliminaron los botones de cambio manual de pestañas. 
              Cada rol queda confinado de forma limpia y segura a su área de trabajo. */}
          
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Conectado como: <span className="font-bold text-gray-700">{usuario.nombre}</span>
          </span>

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
            <HistorialReservas />
            <CancelarReserva />
          </div>
        ) : (
          /* 🔒 DEFENSIVIDAD DE CÓDIGO: Resguardo estricto ante inyecciones de estado manuales */
          esAdministrador ? (
            <div className='space-y-8 animate-fade-in'>
              <header className='text-center mb-2'>
                <h1 className='text-2xl font-extrabold text-gray-900'>Panel de Gestión Administrativa</h1>
                <p className='text-gray-600 text-xs'>
                  Panel de control de operaciones, control de aforo y auditoría financiera del condominio
                </p>
              </header>

              <VistaConserje />
              <GestionAdmin />
              <ReportesAdmin />
              <BloqueosAdmin />
            </div>
          ) : (
            <div className='p-8 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm font-medium'>
              ⚠️ Acceso denegado. Tu cuenta no posee credenciales administrativas para auditar este módulo.
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;