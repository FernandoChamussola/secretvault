// Verificar se está autenticado
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Salvar token e usuário
export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Pegar usuário atual
export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Fazer logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
