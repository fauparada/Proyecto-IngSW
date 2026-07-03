import { useState, useEffect } from 'react';

export default function HistorialReservas() {
  const [historial, setHistorial] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [cargando, setCargando] = useState(true);

  // Extraemos el ID del residente desde el sessionStorage de forma transparente
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
  }, [filtroEstado]); // Re-ejecuta la consulta SQL si el usuario cambia el filtro en la pantalla

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white text-gray-800 rounded-xl shadow-md border border-gray-100 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Mi Historial de Reservas
          </h2>
          <p className="text-xs text-gray-500">Residente: {usuario?.nombre} (Depto {usuario?.departamento})</p>
        </div>

        {/* Filtro por Estado */}
        <div>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
        <p className="text-center text-xs text-gray-400 py-6">Consultando bitácora histórica...</p>
      ) : historial.length === 0 ? (
        <p className="text-center text-xs text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          No tienes registros en este estado.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Listado ordenado por fecha descendente desde SQL */}
          {historial.map((res) => (
            <div key={res.id_reserva} className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3 shadow-sm">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-mono text-[10px] text-gray-400 font-bold">RESERVA N° {res.id_reserva}</p>
                  <p className="text-gray-800 font-bold text-sm mt-0.5">Fecha: {res.fecha}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Invitados declarados: <span className="text-gray-700 font-bold">{res.cant_invitados}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono font-black text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {res.hora_inicio.slice(0,5)} - {res.hora_fin.slice(0,5)}
                  </p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block mt-2 border ${
                    res.estado === 'Aprobada' ? 'bg-green-50 text-green-700 border-green-200' :
                    res.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {res.estado === 'Aprobada' ? 'Concretada' : res.estado}
                  </span>
                </div>
              </div>

              {/* Si la reserva fue rechazada por el administrador, exponemos el motivo explícito */}
              {res.estado === 'Rechazada' && res.motivo_rechazo && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-[11px] p-2.5 rounded-lg font-medium">
                  <span className="font-bold">Motivo rechazo:</span> {res.motivo_rechazo}
                </div>
              )}

              {/* 💰 CRITERIO 3: Despliegue de cobros o multas asociados a la reserva */}
              {res.monto_cobro !== null && res.monto_cobro !== undefined && (
                <div className={`p-3 rounded-lg border flex justify-between items-center text-xs transition-all ${
                  res.pagado_cobro 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div>
                    <p className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Gasto o Multa Asociada</p>
                    <p className="font-bold text-gray-800 mt-0.5">{res.motivo_cobro}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-gray-900">${res.monto_cobro.toLocaleString('es-CL')}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block mt-1 shadow-sm border ${
                      res.pagado_cobro 
                        ? 'bg-white text-green-700 border-green-300' 
                        : 'bg-white text-rose-600 border-rose-300'
                    }`}>
                      {res.pagado_cobro ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}