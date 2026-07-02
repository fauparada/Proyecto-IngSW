import { useState } from 'react';

export default function Login({ alLoguear }) {
  const [esRegistro, setEsRegistro] = useState(false); //Controla si muestra Login o Sign-In
  const [departamento, setDepartamento] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    const endpoint = esRegistro ? '/api/auth/register' : '/api/auth/login';
    const payload = esRegistro 
      ? { departamento, nombre, password } 
      : { departamento, password };

    try {
      const response = await fetch(`http://localhost:4005${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (esRegistro) {
          setMensajeExito("🎉 ¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
          setEsRegistro(false);
          setNombre('');
        } else {
          // Guardamos sesión real
          sessionStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
          alLoguear(data.usuario);
        }
      } else {
        setError(data.error || 'Ocurrió un error inesperado.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor backend.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-6 bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-black text-amber-400">Edificio Residencial</h2>
          <p className="text-xs text-slate-400 mt-1">
            {esRegistro ? 'Registra una nueva cuenta de propietario' : 'Ingresa a tu cuenta de copropietario'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-xs rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {mensajeExito && (
          <div className="p-3 bg-green-900/30 border border-green-500/50 text-green-200 text-xs rounded-lg text-center font-medium">
            {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo extra exclusivo para la creación de cuenta (Sign-In) */}
          {esRegistro && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Faustina Parada"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">N° Departamento</label>
            <input
              type="text"
              placeholder="Ej: 301"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña / PIN</label>
            <input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition duration-150 shadow-lg shadow-amber-500/10"
          >
            {esRegistro ? 'Registrar Departamento' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Botón conmutador para alternar la vista */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(!esRegistro);
              setError('');
              setMensajeExito('');
            }}
            className="text-xs text-amber-400/80 hover:text-amber-400 underline transition"
          >
            {esRegistro ? '¿Ya tienes una cuenta? Inicia sesión aquí' : '¿Tu departamento no tiene cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}