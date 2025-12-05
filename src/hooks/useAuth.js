/**
 * useAuth Hook
 * 
 * Hook customizado para gerenciar autenticação com Firebase.
 * Retorna: usuário logado, loading state, funções de login/signup/logout.
 */

import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { createOrUpdateUser, getUserById } from '../services/users';

/**
 * Hook de autenticação do Firebase
 * @returns {Object} { user, loading, error, login, signup, logout }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Observa mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          // Busca dados do usuário no Firestore
          const userProfile = await getUserById(currentUser.uid);
          setUserData(userProfile);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Faz login com email e senha
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria nova conta com email e senha
   */
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);

      // Cria usuário no Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      // Atualiza displayName
      if (displayName) {
        await updateProfile(currentUser, { displayName });
      }

      // Cria documento do usuário no Firestore
      await createOrUpdateUser(currentUser.uid, {
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      });

      return currentUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz logout
   */
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário no Firestore
   */
  const updateUserData = async (updates) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);
      await createOrUpdateUser(user.uid, updates);
      setUserData({ ...userData, ...updates });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    login,
    signup,
    logout,
    updateUserData,
    isAuthenticated: !!user,
  };
};
