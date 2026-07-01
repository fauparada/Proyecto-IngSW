import { useState } from 'react';

export default function ReportesAdmin() {
  const [mes, setMes] = useState('06');
  const [anio, setAnio] = useState('2026');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);

  const consultarReporte = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await fetch(`http://localhost:4005/api/admin/reporte?anio=${anio}&mes=${mes}`);
      const data = await response.json();
      if (response.ok) setDatos(data);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  //Exportar sección específica a PDF nativo limpia de botones
  const exportarPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100 print:shadow-none print:border-none print:mt-0">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2 print:text-black">
        Generación de Reportes Estadísticos
      </h2>

      {/* Formulario de Selección - Se oculta automáticamente al imprimir en PDF */}
      <form onSubmit={consultarReporte} className="space-y-4 mb-6 print:hidden">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Mes del Reporte</label>
            <select value={mes} onChange={(e) => setMes(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white">
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Año</label>
            <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} className="w-full p-1.5 text-xs border border-gray-300 rounded-lg" />
          </div>
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">
          {cargando ? 'Compilando Métricas...' : 'Analizar Periodo'}
        </button>
      </form>

      {/* CUERPO DEL INFORME (Se visualiza en pantalla y se diseña para el PDF) */}
      {datos && (
        <div className="space-y-6 border border-gray-100 p-4 rounded-xl bg-gray-50/50 print:bg-white print:p-0 print:border-none">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase">Informe de Uso de Áreas Comunes</h3>
              <p className="text-[10px] text-gray-500">Periodo de Auditoría: {datos.periodo}</p>
            </div>
            <button onClick={exportarPDF} className="px-3 py-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded text-[11px] transition print:hidden">
              Exportar PDF
            </button>
          </div>

          {/* Métrica 1: Volumen Total */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center print:border-black">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad Total de Reservas</p>
            <p className="text-3xl font-black text-blue-600 mt-1 print:text-black">{datos.total}</p>
            <p className="text-[10px] text-gray-400 mt-1">Solicitudes procesadas activas en el mes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Métrica 2: Horarios Más Usados */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 print:border-black">
              <h4 className="text-xs font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">⏰ Bloques Horarios Alta Demanda</h4>
              {datos.horariosMasUsados.length === 0 ? (
                <p className="text-[11px] text-gray-400">Sin registros.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px]">
                  {datos.horariosMasUsados.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-gray-600">
                      <span>{idx+1}. {item.horario}</span>
                      <span className="font-bold text-gray-800">{item.cantidad} usos</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Métrica 3: Residentes Frecuentes */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 print:border-black">
              <h4 className="text-xs font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">👤 Residentes más Frecuentes</h4>
              {datos.residentesFrecuentes.length === 0 ? (
                <p className="text-[11px] text-gray-400">Sin registros.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px]">
                  {datos.residentesFrecuentes.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-gray-600">
                      <span className="truncate">{idx+1}. {item.nombre} (Depto {item.depto})</span>
                      <span className="font-bold text-gray-800">{item.cant} res.</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}