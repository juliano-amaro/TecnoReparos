
import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { WrenchScrewdriverIcon } from './Icons';

interface LoginPageProps {
  onLogin: (username: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded authentication
    if ((username === 'tecnico' || username === 'Carlos' || username === 'Ana') && password === '1234') {
      onLogin(username);
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 relative">
        <div className="absolute top-4 right-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <WrenchScrewdriverIcon className="h-16 w-16 mx-auto text-primary-500" />
                <h1 className="text-3xl font-bold mt-4">TecnoReparos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerenciador de Ordens de Serviço</p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-semibold text-center mb-6">Acessar Sistema</h2>
                    {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            Usuário
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="ex: tecnico"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
   