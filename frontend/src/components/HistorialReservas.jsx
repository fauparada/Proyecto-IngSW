import { useState, useEffect } from 'react';

export default function HistorialReservas() {
  const [historial, setHistorial] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [cargando, setCargando] = useState(true);

  //Extraemos el ID del residente desde el sessionStorage de forma transparente
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
  const idUsuario = usuario?.id_usuario;

  const cargarHistorial = async () => {
    if (!idUsuario) return;
    setCargando(true);
    try {
      const response = await fetch(`http://localhost:4005/api/reservas/historial?id_usuario=${idUsuario}&estado=${filtroEstado}`);
      const data = await response.json();
      if (response.ok && data.historial) {
        setHistorial(data.historial);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [filtroEstado]); //Re-ejecuta la consulta SQL si el usuario cambia el filtro en la pantalla

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            📜 Mi Historial de Reservas
          </h2>
          <p className="text-xs text-slate-400">Residente: {usuario?.nombre} (Depto {usuario?.departamento})</p>
        </div>

        {/* Filtro por Estado */}
        <div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="Todas">Mostrar Todas</option>
            <option value="Aprobada">Aprobadas / Concretadas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Rechazada">Rechazadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <p className="text-center text-xs text-slate-400 py-6">Consultando bitácora histórica...</p>
      ) : historial.length === 0 ? (
        <p className="text-center text-xs text-slate-400 py-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
          No tienes registros en este estado.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Listado ordenado por fecha descendente desde SQL */}
          {historial.map((res) => (
            <div key={res.id_reserva} className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-mono text-[10px] text-slate-500">RESERVA N° {res.id_reserva}</p>
                  <p className="text-slate-200 font-semibold mt-0.5">Fecha: {res.fecha}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Invitados declarados: <span className="text-slate-300 font-bold">{res.cant_invitados}</span></p>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-amber-400 text-sm">
                    {res.hora_inicio.slice(0,5)} - {res.hora_fin.slice(0,5)}
                  </p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block mt-1 ${
                    res.estado === 'Aprobada' ? 'bg-green-950 text-green-400 border border-green-800/50' :
                    res.estado === 'Pendiente' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                    'bg-red-950 text-red-400 border border-red-900/50'
                  }`}>
                    {res.estado === 'Aprobada' ? 'Concretada' : res.estado}
                  </span>
                </div>
              </div>

              {/* Si la reserva fue rechazada por el administrador, exponemos el motivo explícito */}
              {res.estado === 'Rechazada' && res.motivo_rechazo && (
                <div className="bg-red-950/20 border border-red-900/30 text-red-300 text-[11px] p-2 rounded mt-1 font-medium">
                  Motivo rechazo: {res.motivo_rechazo}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}