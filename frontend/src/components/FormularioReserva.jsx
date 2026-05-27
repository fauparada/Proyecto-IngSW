import { useState } from 'react';

export default function FormularioReserva() {
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [invitados, setInvitados] = useState(1);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeExito('');
        setMensajeError('');

        const payload = {
            fecha,
            hora_inicio: `${horaInicio}:00`,
            hora_fin: `${horaFin}:00`,
            cant_invitados: Number(invitados),
            id_usuario: 1, //ID estático simulando al residente logueado por ahora
            id_espacio: 2 //ID estático simulando la sala de eventos por ahora
        };

        try {
            const response = await fetch('http://localhost:4005/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                //si se crea la reserva exitosamente
                setMensajeExito(`Reserva creada. Código: ${data.reserva.id_reserva}. Estado actual: ${data.reserva.estado}`)
                //limpiar formulario
                setFecha(''); setHoraInicio(''); setHoraFin(''); setInvitados(1);
            } else {
                //Captura el error de conflicto o de campos vacíos
                setMensajeError(data.error ||'Hubo un problema al procesar la reserva.');
            }
        } catch (error) {
            setMensajeError('No se pudo conectar con el servidor backend.')
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Reserva de Espacios Comunes</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Fecha */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Fecha</label>
          <input 
            type="date" 
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Campos de Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hora Inicio</label>
            <input 
              type="time" 
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hora Término</label>
            <input 
              type="time" 
              required
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cantidad de Invitados */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad de Invitados</label>
          <input 
            type="number" 
            min="1"
            required
            value={invitados}
            onChange={(e) => setInvitados(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón de Envío */}
        <button 
          type="submit" 
          disabled={cargando}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400"
        >
          {cargando ? 'Procesando...' : 'Confirmar Reserva'}
        </button>
      </form>

      {/* Notificaciones visuales */}
      {mensajeExito && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
          {mensajeError}
        </div>
      )}
    </div>
  );
}
