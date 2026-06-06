import { useState } from "react";

export default function CancelarReserva() {
    const [idReserva, setIdReserva] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);

    const handleCancelar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje({ texto: '', tipo: '' });
    

        try {
            const response = await fetch('http://localhost:4005/api/reservas/cancelar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_reserva: Number(idReserva),
                    id_usuario: Number(departamento),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ texto: data.mensaje, tipo: 'exito' });
                setIdReserva('');
                setDepartamento('');
            } else {
                setMensaje({ texto: data.error, tipo: 'error' });
            }
        } catch (error) {
            setMensaje({ texto: 'No se pudo conectar con el servidor backend.', tipo: 'error' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-red-600 text-center">Anulación de Reservas</h2>
            <p className="text-xs text-gray-500 mb-4 text-center">
                Para cancelar, introduce el código de tu reserva y confirma tu departamento.
            </p>

            <form onSubmit={handleCancelar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ID de Reserva</label>
                        <input
                            type='number'
                            required
                            value={idReserva}
                            onChange={(e) => setIdReserva(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ej.: 14"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">N° Departamento</label>
                        <input
                            type="number"
                            required
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ej.: 901"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition duration-200 disabled:bg-gray-400"
                >
                    {cargando ? 'Procesando...' : 'Anular Reserva'}
                </button>
            </form>

            {mensaje.texto && (
                <div className={`mt-4 p-3 rounded-lg text-xs text-center font-medium border ${
                    mensaje.tipo === 'exito' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                {mensaje.tipo === 'exito' ? (
                    <div>
                        <p className="font-bold text-sm mb-1">Anulación Confirmada</p>
                        <p>{mensaje.texto}</p>
                        <p className="text-[10px] text-gray-500 mt-1">El bloque horario ha quedado liberado para la comunidad.</p>
                    </div>
                ) : (
                    <div>
                        <p className="font-bold text-sm mb-1">Operación Rechazada</p>
                        <p>{mensaje.texto}</p>
                    </div>
                )}  
                </div>
            )}
        </div>
    );
}