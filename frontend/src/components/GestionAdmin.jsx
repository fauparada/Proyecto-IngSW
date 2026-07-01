import { useState, useEffect } from 'react';

export default function GestionAdmin() {
  const [pendientes, setPendientes] = useState([]);
  const [motivos, setMotivos] = useState({}); 
  const [mensaje, setMensaje] = useState('');

  // ⚙️ Estados para las Reglas de la Sala
  const [espaciosList, setEspaciosList] = useState([]);
  const [espacioId, setEspacioId] = useState('');
  const [apertura, setApertura] = useState('09:00');
  const [cierre, setCierre] = useState('22:00');
  const [maxAforo, setMaxAforo] = useState(20);
  const [maxHoras, setMaxHoras] = useState(4);

  // Carga inicial de solicitudes pendientes
  const cargarPendientes = async () => {
    try {
      const response = await fetch('http://localhost:4005/api/admin/pendientes');
      const data = await response.json();
      if (response.ok && data.reservas) setPendientes(data.reservas);
    } catch (error) {
      console.error("Error al cargar solicitudes admin:", error);
    }
  };

  // Carga inicial de los espacios comunes existentes
  const cargarEspaciosAdmin = async () => {
    try {
      const res = await fetch('http://localhost:4005/api/espacios');
      const data = await res.json();
      if (res.ok && data.espacios) {
        setEspaciosList(data.espacios);
        if (data.espacios.length > 0) {
          setEspacioId(data.espacios[0].id_espacio);
        }
      }
    } catch (error) {
      console.error("Error al cargar espacios en panel admin:", error);
    }
  };

  useEffect(() => {
    cargarPendientes();
    cargarEspaciosAdmin();
  }, []);

  const handleDecision = async (id_reserva, nuevo_estado) => {
    const motivo = motivos[id_reserva] || '';
    
    if (nuevo_estado === 'Rechazada' && !motivo.trim()) {
      alert("Por favor, ingresa un motivo para el rechazo.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4005/api/reservas/modificar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_reserva,
          nuevo_estado,
          motivo_rechazo: nuevo_estado === 'Rechazada' ? motivo : null
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje(`Reserva N°${id_reserva} modificada exitosamente.`);
        cargarPendientes(); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error al procesar acción del administrador:", error);
    }
  };

  const guardarlasReglas = async (e) => {
    e.preventDefault();
    if (!espacioId) {
      alert("Debes seleccionar una sala primero.");
      return;
    }
    try {
      const response = await fetch('http://localhost:4005/api/espacios/configurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_space: Number(espacioId), // se mapea a id_espacio en el backend
          id_espacio: Number(espacioId),
          hora_apertura: `${apertura}:00`,
          hora_cierre: `${cierre}:00`,
          capacidad_maxima: Number(maxAforo),
          duracion_maxima_horas: Number(maxHoras)
        })
      });
      if (response.ok) {
        alert("¡Reglas de la sala actualizadas con éxito!");
      }
    } catch (error) {
      console.error("Error al guardar reglas:", error);
    }
  };

  const handleMotivoChange = (id, valor) => {
    setMotivos(prev => ({ ...prev, [id]: valor }));
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
        Panel de Aprobación de Administración
      </h2>

      {mensaje && (
        <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg text-center font-medium">
          {mensaje}
        </div>
      )}

      {pendientes.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-6">No hay solicitudes pendientes de revisión.</p>
      ) : (
        <div className="space-y-4">
          {pendientes.map((res) => (
            <div key={res.id_reserva} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold text-gray-800 text-sm">Reserva N° {res.id_reserva}</p>
                  <p className="text-gray-600 mt-0.5">Propietario: <span className="font-semibold">{res.nombre_residente}</span> (Dpto. {res.id_usuario})</p>
                  <p className="text-gray-500 font-medium">Fecha: {res.fecha} | {res.hora_inicio.slice(0,5)} - {res.hora_fin.slice(0,5)}</p>
                </div>
                <span className='px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded uppercase text-[10px]'>
                  {res.estado}
                </span>
              </div>

              <div className="pt-1">
                <input
                  type='text'
                  placeholder="Escribe el motivo si vas a rechazar..."
                  value={motivos[res.id_reserva] || ''}
                  onChange={(e) => handleMotivoChange(res.id_reserva, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleDecision(res.id_reserva, 'Aprobada')}
                  className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-xs transition duration-150"
                >Aprobar</button>
                <button
                  onClick={() => handleDecision(res.id_reserva, 'Rechazada')}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md text-xs transition duration-150"
                >Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⚙️ FORMULARIO CORREGIDO Y BLINDADO */}
      <form onSubmit={guardarlasReglas} className="mt-8 border-t border-gray-100 pt-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          Configurar Reglas de Uso
        </h3>
        
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Seleccionar Sala</label>
          <select 
            value={espacioId} 
            onChange={(e) => setEspacioId(e.target.value)} 
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {espaciosList.length === 0 ? (
              <option value="">No hay salas registradas</option>
            ) : (
              espaciosList.map(e => (
                <option key={e.id_espacio} value={e.id_espacio}>🏢 {e.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Hora Apertura</label>
            <input 
              type="time" 
              value={apertura} 
              onChange={(e) => setApertura(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Hora Cierre</label>
            <input 
              type="time" 
              value={cierre} 
              onChange={(e) => setCierre(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Capacidad Máxima</label>
            <input 
              type="number" 
              value={maxAforo} 
              onChange={(e) => setMaxAforo(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Duración Máx (Horas)</label>
            <input 
              type="number" 
              value={maxHoras} 
              onChange={(e) => setMaxHoras(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition duration-150"
        >
          Guardar Reglas Futuras
        </button>
      </form>
    </div>
  );
}