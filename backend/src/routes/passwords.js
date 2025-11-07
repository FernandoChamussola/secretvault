const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Listar todas as senhas do usuário
router.get('/', async (req, res) => {
  try {
    const [passwords] = await pool.query(
      'SELECT * FROM passwords WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(passwords);
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ error: 'Erro ao buscar senhas' });
  }
});

// Buscar uma senha específica
router.get('/:id', async (req, res) => {
  try {
    const [passwords] = await pool.query(
      'SELECT * FROM passwords WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (passwords.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    res.json(passwords[0]);
  } catch (error) {
    console.error('Get password error:', error);
    res.status(500).json({ error: 'Erro ao buscar senha' });
  }
});

// Criar nova senha
router.post('/', async (req, res) => {
  try {
    const { title, password, description } = req.body;

    // Validação básica
    if (!title || !password) {
      return res.status(400).json({ error: 'Título e senha são obrigatórios' });
    }

    const [result] = await pool.query(
      'INSERT INTO passwords (user_id, title, password, description) VALUES (?, ?, ?, ?)',
      [req.userId, title, password, description || null]
    );

    // Buscar a senha criada
    const [newPassword] = await pool.query(
      'SELECT * FROM passwords WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPassword[0]);
  } catch (error) {
    console.error('Create password error:', error);
    res.status(500).json({ error: 'Erro ao criar senha' });
  }
});

// Atualizar senha
router.put('/:id', async (req, res) => {
  try {
    const { title, password, description } = req.body;

    // Validação básica
    if (!title || !password) {
      return res.status(400).json({ error: 'Título e senha são obrigatórios' });
    }

    // Verificar se a senha existe e pertence ao usuário
    const [existing] = await pool.query(
      'SELECT id FROM passwords WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    // Atualizar
    await pool.query(
      'UPDATE passwords SET title = ?, password = ?, description = ? WHERE id = ? AND user_id = ?',
      [title, password, description || null, req.params.id, req.userId]
    );

    // Buscar senha atualizada
    const [updated] = await pool.query(
      'SELECT * FROM passwords WHERE id = ?',
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
});

// Deletar senha
router.delete('/:id', async (req, res) => {
  try {
    // Verificar se a senha existe e pertence ao usuário
    const [existing] = await pool.query(
      'SELECT id FROM passwords WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }

    // Deletar
    await pool.query(
      'DELETE FROM passwords WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.json({ message: 'Senha deletada com sucesso' });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ error: 'Erro ao deletar senha' });
  }
});

module.exports = router;
