import { useState, useEffect } from 'react';

export default function FormularioReserva() {
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [invitados, setInvitados] = useState(1);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [bloquesOcupados, setBloquesOcupados] = useState([]);
    const [nombresInput, setNombresInput] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [nombreResidente, setNombreResidente] = useState('');
    const [espacios, setEspacios] = useState([]);
    const [idEspacioSeleccionado, setIdEspacioSeleccionado] = useState('');
    const [cargandoEspacios, setCargandoEspacios] = useState(true);

    useEffect(() => {
      const obtenerEspacios = async () => {
        try {
          const response = await fetch('http://localhost:4005/api/espacios');
          const data = await response.json();
          if (response.ok && data.espacios) {
            setEspacios(data.espacios);
            if(data.espacios.length > 0) {
              setIdEspacioSeleccionado(data.espacios[0].id_espacio);
            }
          }
        } catch (error) {
          console.error("Error al cargar los espacios comunes en el formulario:", error);
        } finally {
          setCargandoEspacios(false);
        }
      };

      obtenerEspacios();
    }, []);

    useEffect(() => {
      const consultarDisponibilidad = async () => {
        if (!fecha) return;

        try {
          const id_espacio = 2;
          const response = await fetch(`http://localhost:4005/api/disponibilidad?fecha=${fecha}&id_espacio=${id_espacio}`);
          if (response.ok) {
            const data = await response.json();
            setBloquesOcupados(data.bloquesOcupados);
          }
        } catch (error) {
          console.error("Error al conectar con el endpoint de disponibilidad");
        }
      };

      consultarDisponibilidad();
    }, [fecha]);

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
            nombres_invitados: nombresInput.split(',').map(n => n.trim()).filter(n => n !== ''),
            id_usuario: Number(departamento), //Ahora el ID corresponde al depto. del que hace la reserva para llevar un registro
            id_espacio: Number(idEspacioSeleccionado), //ahora el id es dinámico
            nombre_residente: nombreResidente
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

        {/* Número de Departamento */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-1'>Número de Departamento</label>
          <input
            type='number'
            placeholder='Ej. 504'
            required
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
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

        {/* Lista de invitados */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-1'>
            Nombres de los Invitados (Separados por comas)
          </label>
          <textarea
            placeholder='Ej.: Juan Pérez, María Soto, Carlos Muñoz...'
            value={nombresInput}
            onChange={(e) => setNombresInput(e.target.value)}
            rows="2"
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
          />
        </div>

        {/* Selector de espacio */}
        <div className='flex flex-col space-y-1'>
          <label className='text-xs font-bold text-gray-700'>Área Común a Reservar</label>

          {cargandoEspacios ? (
            <p className='text-xs text-gray-400 animate-pulse'>Cargando espacios...</p>
          ) : espacios.length === 0 ? (
            <p className='text-xs text-red-500 font-medium'>No hay áreas comunes registradas en el sistema.</p>
          ) : (
            <select
              value={idEspacioSeleccionado}
              onChange={(e) => setIdEspacioSeleccionado(e.target.value)}
              className='w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium'
            >
              {espacios.map((esp) => (
                <option key={esp.id_espacio} value={esp.id_espacio}>
                  {esp.nombre} (Capacidad máx.: {esp.capacidad_maxima} personas)
                </option>
              ))}
            </select>
          )}
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

      <div className='mt-6 pt-6 border-t border-gray-100'>
        <h3 className='text-sm font-bold text-gray-700 mb-2'>Bloques ocupados para este día:</h3>
        {bloquesOcupados.length === 0 ? (
          <p className='text-xs text-green-600 font-medium bg-green-50 p-2 rounded-lg text-center'>
            ¡Todo el día disponible! Elige el horario que desees.
          </p>
        ) : (
          <div className='space-y-1.5'>
            {bloquesOcupados.map((bloque, index) => (
              <div key={index} className='flex justify-between items-center text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg font-medium'>
                <span>{bloque.hora_inicio.slice(0, 5)} - {bloque.hora_fin.slice(0, 5)}</span>
                <span className='text-[10px] uppercase px-1.5 py-0.5 bg-amber-200 rounded text-amber-900'>
                  {bloque.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
