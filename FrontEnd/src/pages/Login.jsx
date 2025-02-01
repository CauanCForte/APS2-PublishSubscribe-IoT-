import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// "Banco de dados" mockado
const userDatabase = {
  "cauan_painel": { password: "cauan", role: "painel" },
  "cauan_pager": { password: "cauan", role: "pager" },
  "lucca_painel": { password: "lucca", role: "painel" },
  "lucca_pager": { password: "lucca", role: "pager" },
};

function Login() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();

    // Verifica se "username" existe no "banco"
    const userData = userDatabase[username];

    // Se não existir ou a senha não bater, exibe erro
    if (!userData || userData.password !== password) {
      alert('Usuário ou senha inválidos.');
      return;
    }

    // Determinamos a 'role' do usuário
    const userRole = userData.role;

    // Armazenamos esse papel em localStorage (ou em contexto global)
    localStorage.setItem('userRole', userRole);

    // Redireciona para o dashboard
    navigate('/dashboard'); 
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', marginTop: '100px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuário:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
