import { useState, useEffect } from 'react';

export default function BloqueosAdmin() {
  const [espacios, setEspacios] = useState([]);
  const [espacioId, setEspacioId] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Cargamos las salas disponibles para bloquear
    fetch('http://localhost:4005/api/espacios')
      .then(res => res.json())
      .then(data => {
        if (data.espacios) {
          setEspacios(data.espacios);
          if (data.espacios.length > 0) setEspacioId(data.espacios[0].id_espacio);
        }
      });
  }, []);

  const handleBloquear = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) {
      alert("El motivo del bloqueo es estrictamente obligatorio.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4005/api/admin/bloqueos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_espacio: espacioId,
          fecha_inicio: inicio,
          fecha_fin: fin,
          motivo: motivo
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje("🔒 Rango de fechas bloqueado correctamente.");
        setMotivo('');
        setInicio('');
        setFin('');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error al bloquear fechas:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
        🔒 Restricción y Bloqueo de Fechas
      </h2>

      {mensaje && (
        <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg text-center font-medium">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleBloquear} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Seleccionar Área Común</label>
          <select value={espacioId} onChange={(e) => setEspacioId(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white">
            {espacios.map(e => (
              <option key={e.id_espacio} value={e.id_espacio}>🏢 {e.nombre}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Fecha Inicio</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg required" required />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Fecha Fin</label>
            <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg required" required />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Motivo del Bloqueo (Obligatorio)</label>
          <input 
            type="text" 
            placeholder="Ej: Mantención estructural de filtros de piscina, pintura anual..." 
            value={motivo} 
            onChange={(e) => setMotivo(e.target.value)} 
            className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>

        <button type="submit" className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition">
          Aplicar Bloqueo Administrativo
        </button>
      </form>
    </div>
  );
}