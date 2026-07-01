import { useState, useEffect } from 'react';

export default function VistaConserje() {
    //iniciamos con la fecha de hoy en formato local yyyy-mm-dd
    const hoy = new Date().toISOString().split('T')[0];
    const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nuevoNombreEspacio, setNuevoNombreEspacio] = useState('');
    const [capacidad, setCapacidad] = useState(20);

    const handleCrearEspacio = async (e) => {
        e.preventDefault();
        if (!nuevoNombreEspacio.trim()) return;

        try {
            const response = await fetch('http://localhost:4005/api/espacios', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nuevoNombreEspacio, capacidad_maxima: capacidad })
            });

            if (response.ok) {
                alert("Espacio añadido con éxito");
                setNuevoNombreEspacio('');
            }
        } catch (error) {
            console.error("Error al crear espacio");
        }
    };

    //hook que cumple el criterio que la vista se actualiza automáticamente
    useEffect(() => {
        const fetchReservasConserje = async () => {
            setCargando(true);
            try {
                const response = await fetch(`http://localhost:4005/api/conserje/reservas?fecha=${fechaSeleccionada}`);
                const data = await response.json();
                if (response.ok) {
                    //ordenamos las reservas cronológicamente
                    const ordenadas = data.reservas.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
                    setReservas(ordenadas);
                }
            } catch (error) {
                console.error("Error al conectar con la vista del conserje");
            } finally {
                setCargando(false);
            }
        };

        fetchReservasConserje();
    }, [fechaSeleccionada]); //se gatilla solo al cambiar la fecha

    return (
        <div className='max-w-xl mx-auto mt-10 p-6 bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800'>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-slate-800 pb-4 gap-4'>
                <div>
                    <h2 className='text-xl font-bold text-amber-400 flex items-center gap-2'>
                        Vista Diaria del Conserje
                    </h2>
                    <p className='text-xs text-slate-400'>Control de espacios comunes</p>
                </div>

                <div>
                    <input
                        type="date"
                        value={fechaSeleccionada}
                        onChange={(e) => setFechaSeleccionada(e.target.value)}
                        className='bg-slate-800 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                    />
                </div>
            </div>

            <form onSubmit={handleCrearEspacio} className='bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700 space-y-3'>
                <h3 className='text-sm font-bold text-amber-400'>Registrar Nueva Área Común</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <input
                        type='text'
                        placeholder='Ej.: Quincho Azotea'
                        value={nuevoNombreEspacio}
                        onChange={(e) => setNuevoNombreEspacio(e.target.value)} className='bg-slate-900 border border-slate-700 text-slate-100 px-3  py-1.5 rounded-lg text-xs focus:outline-none'
                        required
                    />
                    <input
                        type="number"
                        placeholder='Capacidad Máx.'
                        value={capacidad}
                        onChange={(e) => setCapacidad(e.target.value)}
                        className='bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rpunded-lg text-xs focus:outline-none'
                    />
                </div>
                <button type="submit" className='w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 rounded text-xs transition'>
                    Guardar Espacio
                </button>
            </form>

            {cargando ? (
                <p className='text-center text-xs text-slate-400 py-6'>Actualizando...</p>
            ) : reservas.length === 0 ? (
                <p className='text-center text-xs text-slate-400 py-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700'>
                    No hay bloques reservados para este día.
                </p>
            ) : (
                <div className='space-y-3'>
                    {reservas.map((res) => (
                        <div
                            key={res.id_reserva}
                            className='flex justify-between items-center bg-slate-800 border border-slate-700 p-3 rounded-lg hover:border-slate-600 transition duration-150'
                        >
                            <div className='space-y-1'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-bold px-2 py-0.5 bg-slate-700 text-slate-300 rounded'>
                                        Depto. {res.departamento}
                                    </span>
                                    <span className='text-sm font-medium text-slate-200'>{res.nombre}</span>
                                </div>
                                <p className='text-xs text-slate-400'>
                                    Invitados registrados: {res.invitados}
                                </p>
                            </div>

                            <div className='text-right'>
                                <p className='text-sm font-mono font-bold text-amber-400'>
                                    {res.hora_inicio.slice(0, 5)} - {res.hora_fin.slice(0, 5)}
                                </p>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    res.estado === 'Aprobada' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                                }`}>
                                    {res.estado}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}