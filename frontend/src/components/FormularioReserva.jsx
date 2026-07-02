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
    const [espacios, setEspacios] = useState([]);
    const [idEspacioSeleccionado, setIdEspacioSeleccionado] = useState('');
    const [cargandoEspacios, setCargandoEspacios] = useState(true);

    const usuarioSesion = JSON.parse(sessionStorage.getItem('usuarioLogueado'));

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
        if (!fecha || !idEspacioSeleccionado) return;

        try {
          const response = await fetch(`http://localhost:4005/api/disponibilidad?fecha=${fecha}&id_espacio=${idEspacioSeleccionado}`);
          if (response.ok) {
            const data = await response.json();
            setBloquesOcupados(data.bloquesOcupados || []);
          }
        } catch (error) {
          console.error("Error al conectar con el endpoint de disponibilidad");
        }
      };

      consultarDisponibilidad();
    }, [fecha, idEspacioSeleccionado]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeExito('');
        setMensajeError('');

        // Validación de resguardo en caso de que la sesión expire o se corrompa
        if (!usuarioSesion?.id_usuario) {
            setMensajeError('Error de sesión. Por favor, vuelve a iniciar sesión.');
            setCargando(false);
            return;
        }

        const payload = {
            fecha,
            hora_inicio: `${horaInicio}:00`,
            hora_fin: `${horaFin}:00`,
            cant_invitados: Number(invitados),
            nombres_invitados: nombresInput.split(',').map(n => n.trim()).filter(n => n !== ''),
            id_usuario: Number(usuarioSesion.id_usuario),
            id_espacio: Number(idEspacioSeleccionado),
            nombre_residente: usuarioSesion.nombre
        };

        try {
            const response = await fetch('http://localhost:4005/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setMensajeExito(`¡Excelente! Reserva creada con éxito. Código: ${data.reserva.id_reserva}.`)
                // Limpieza de campos variables
                setFecha(''); setHoraInicio(''); setHoraFin(''); setInvitados(1); setNombresInput('');
            } else {
                setMensajeError(data.error || 'Hubo un problema al procesar la reserva.');
            }
        } catch (error) {
            setMensajeError('No se pudo conectar con el servidor backend.')
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100 animate-fade-in">
      <h2 className="text-xl font-extrabold mb-4 text-gray-800 text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
        Agendar Bloque de Uso
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Selector de espacio común primero (Mejora la experiencia de usuario) */}
        <div className='flex flex-col space-y-1'>
          <label className='text-xs font-bold text-gray-600'>1. Área Común a Reservar</label>
          {cargandoEspacios ? (
            <p className='text-xs text-gray-400 animate-pulse'>Cargando catálogo...</p>
          ) : espacios.length === 0 ? (
            <p className='text-xs text-red-500 font-medium'>No hay áreas comunes registradas en el sistema.</p>
          ) : (
            <select
              value={idEspacioSeleccionado}
              onChange={(e) => setIdEspacioSeleccionado(e.target.value)}
              className='w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-semibold'
            >
              {espacios.map((esp) => (
                <option key={esp.id_espacio} value={esp.id_espacio}>
                  🏢 {esp.nombre} (Capacidad máx.: {esp.capacidad_maxima} pers.)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Campo Fecha */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">2. Seleccionar Fecha</label>
          <input 
            type="date" 
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
          />
        </div>

        {/* Campos de Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Hora Inicio</label>
            <input 
              type="time" 
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Hora Término</label>
            <input 
              type="time" 
              required
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* 👀 ELIMINADO EL INPUT MANUAL DE DEPARTAMENTO: Ahora se renderiza como una etiqueta informativa bloqueada */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex justify-between items-center text-xs text-slate-600">
          <div>
            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Identidad Digital</p>
            <p className="font-semibold mt-0.5 text-slate-800">{usuarioSesion?.nombre}</p>
          </div>
          <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-black">
            DEPTO {usuarioSesion?.departamento}
          </span>
        </div>

        {/* Cantidad de Invitados */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Cantidad de Invitados</label>
          <input 
            type="number" 
            min="1"
            required
            value={invitados}
            onChange={(e) => setInvitados(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold"
          />
        </div>

        {/* Lista de invitados */}
        <div>
          <label className='block text-xs font-bold text-gray-600 mb-1'>
            Nombres de los Invitados (Separados por comas)
          </label>
          <textarea
            placeholder='Ej.: Juan Pérez, María Soto...'
            value={nombresInput}
            onChange={(e) => setNombresInput(e.target.value)}
            rows="2"
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-gray-50'
          />
        </div>

        {/* Botón de Envío */}
        <button 
          type="submit" 
          disabled={cargando}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition duration-200 disabled:bg-gray-400 shadow-md shadow-blue-500/10"
        >
          {cargando ? 'Validando aforos y bloqueos...' : 'Confirmar Solicitud de Reserva'}
        </button>
      </form>

      {/* Notificaciones visuales */}
      {mensajeExito && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs text-center font-medium">
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs text-center font-medium">
          {mensajeError}
        </div>
      )}

      {/* Bloques ocupados dinámicos */}
      <div className='mt-6 pt-5 border-t border-gray-100'>
        <h3 className='text-xs font-bold text-gray-700 mb-2'>Bloques tomados para este espacio:</h3>
        {bloquesOcupados.length === 0 ? (
          <p className='text-[11px] text-green-600 font-medium bg-green-50/60 p-2 rounded-lg text-center border border-green-100'>
            Área libre. Todo el día disponible en la fecha seleccionada.
          </p>
        ) : (
          <div className='space-y-1.5'>
            {bloquesOcupados.map((bloque, index) => (
              <div key={index} className='flex justify-between items-center text-[11px] bg-amber-50 border border-amber-100 text-amber-800 p-2 rounded-lg font-medium'>
                <span>🕒 {bloque.hora_inicio.slice(0, 5)} - {bloque.hora_fin.slice(0, 5)}</span>
                <span className='text-[9px] uppercase font-bold px-1.5 py-0.5 bg-amber-200 rounded text-amber-900'>
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
