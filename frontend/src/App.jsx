import FormularioReserva from './components/FormularioReserva';
import CancelarReserva from './components/CancelarReserva';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Portal de Comunidad Edificio
        </h1>
        <p className="text-gray-600 mt-2 text-sm">Sistema de Gestión de Reservas</p>
      </header>
      
      <main className='space-y-6'>
        <FormularioReserva />
        <CancelarReserva />
      </main>
    </div>
  );
}

export default App;
