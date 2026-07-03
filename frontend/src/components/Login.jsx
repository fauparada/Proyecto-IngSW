import { useState } from 'react';

export default function Login({ alLoguear }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [departamento, setDepartamento] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Estado para el nuevo campo obligatorio
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // Definimos la URL según la acción que el usuario esté realizando
    const url = esRegistro 
      ? 'http://localhost:4005/api/auth/register' 
      : 'http://localhost:4005/api/auth/login';

    // El payload que enviamos al backend
    const payload = esRegistro 
      ? { departamento, nombre, password, email } 
      : { departamento, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (esRegistro) {
          // Si se registró con éxito, lo cambiamos automáticamente al modo login
          alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
          setEsRegistro(false);
          setNombre('');
          setEmail('');
        } else if (data.usuario) {
          // Si el login es exitoso, guardamos en sessionStorage y disparamos el login en App.jsx
          sessionStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
          alLoguear(data.usuario);
        }
      } else {
        setError(data.error || 'Ocurrió un error inesperado.');
      }
    } catch (err) {
      console.error('Error en autenticación:', err);
      setError('No se pudo establecer conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto w-full max-w-md text-center">
        <h2 className="text-3xl font-black tracking-wider text-slate-900 uppercase">
          Portal de Reservas
        </h2>
        <p className="mt-2 text-xs text-gray-500 font-medium">
          {esRegistro 
            ? 'Crea una cuenta para gestionar tus espacios comunes' 
            : 'Ingresa tus credenciales para acceder al sistema'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-gray-100">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                N° de Departamento
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 501"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
              />
            </div>

            {/* Campos condicionales exclusivos del registro */}
            {esRegistro && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: María González"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-150 disabled:bg-gray-300"
              >
                {cargando ? 'Procesando...' : esRegistro ? 'Registrar Mi Cuenta' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          {/* Selector inferior para alternar vistas */}
          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setError('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {esRegistro 
                ? '¿Ya tienes cuenta? Inicia sesión aquí' 
                : '¿Eres nuevo residente? Regístrate aquí'
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}