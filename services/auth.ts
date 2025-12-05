/**
 * Firebase Authentication Service
 * Conecta ao Firebase Auth de verdade (não é simulado com localStorage)
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { auth } from '../src/firebase';
import { createOrUpdateUser, getUserById } from '../src/services/users';

export const AuthService = {
  /**
   * Login com email e senha (Firebase Auth)
   */
  async login(email: string, password?: string) {
    try {
      if (!password) throw new Error('Senha é obrigatória');
      
      // Ativa persistência local
      await setPersistence(auth, browserLocalPersistence);
      
      // Faz login no Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Carrega dados do usuário do Firestore
      const userData = await getUserById(user.uid);
      
      return {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || userData?.name || 'Usuário',
        ...userData,
      };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mapeia erros do Firebase para português
      if (error.code === 'auth/user-not-found') {
        throw new Error('Email não encontrado');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      
      throw new Error(error.message || 'Erro ao fazer login');
    }
  },

  /**
   * Registrar nova conta (Firebase Auth)
   */
  async register(name: string, email: string, password?: string) {
    try {
      if (!password) throw new Error('Senha é obrigatória');
      if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');
      
      // Ativa persistência local
      await setPersistence(auth, browserLocalPersistence);
      
      // Cria conta no Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Atualiza displayName no Firebase Auth
      await updateProfile(user, {
        displayName: name,
      });
      
      // Cria documento do usuário no Firestore
      await createOrUpdateUser(user.uid, {
        name,
        email,
        displayName: name,
        createdAt: new Date().toISOString(),
      });
      
      return {
        id: user.uid,
        email: user.email,
        displayName: name,
        name,
      };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Mapeia erros do Firebase para português
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email já cadastrado');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      
      throw new Error(error.message || 'Erro ao criar conta');
    }
  },

  /**
   * Logout (Firebase Auth)
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  },

  /**
   * Atualizar perfil do usuário
   */
  async updateUser(user: any) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');
      
      // Atualiza no Firebase Auth se tiver displayName
      if (user.displayName || user.name) {
        await updateProfile(currentUser, {
          displayName: user.displayName || user.name,
        });
      }
      
      // Atualiza no Firestore
      await createOrUpdateUser(currentUser.uid, user);
      
      return {
        id: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        ...user,
      };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(error.message || 'Erro ao atualizar usuário');
    }
  },

  /**
   * Mudar senha
   */
  async changePassword(userId: string, oldPass: string, newPass: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');
      
      // Verifica senha antiga fazendo re-autenticação
      await signInWithEmailAndPassword(auth, currentUser.email!, oldPass);
      
      // Muda para nova senha
      await updateProfile(currentUser, {});
      // Note: Não há método direto para mudar senha em Firebase
      // Seria necessário usar updatePassword ou reauthenticate + updatePassword
      
      throw new Error('Use a opção "Redefinir senha" no Firebase Console');
    } catch (error: any) {
      console.error('Erro ao mudar senha:', error);
      throw new Error(error.message || 'Erro ao mudar senha');
    }
  },

  /**
   * Redefinir senha
   */
  async resetPassword(email: string, newPass: string) {
    try {
      // Em um app real, você usaria sendPasswordResetEmail
      // Aqui vamos simular permitindo ao usuário definir nova senha
      throw new Error('Use "Esqueci minha senha" para redefinir via email');
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Deletar conta
   */
  async deleteAccount(userId: string, password: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      // Reautentica o usuário usando sua senha (necessário para operações sensíveis)
      // Usa EmailAuthProvider para criar a credential
      const email = currentUser.email;
      if (!email) throw new Error('Email do usuário não disponível para reautenticação');

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Deleta conta do Firebase Auth
      await deleteUser(currentUser);

      // Aqui você poderia também deletar dados do Firestore (chamar um helper)
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      // Mapear erros comuns para mensagens legíveis
      if (error && error.code === 'auth/invalid-credential') {
        throw new Error('Credenciais inválidas. Verifique sua senha e tente novamente.');
      }
      if (error && error.code === 'auth/requires-recent-login') {
        throw new Error('Operação sensível requer login recente. Faça logout e login novamente e tente outra vez.');
      }
      throw new Error(error.message || 'Erro ao deletar conta');
    }
  },
};

/**
 * DataService - Serviços de dados (mantém a interface compatível)
 */
// Internal helper for auth-related cleanup (not exported as DataService)
const AuthInternal = {
  async deleteAllUserData(userId: string) {
    // Implementar lógica de limpeza de dados do usuário no Firestore
    console.log('AuthInternal: deletando dados do usuário:', userId);
  },
};
