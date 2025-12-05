/**
 * Helpers Utilities
 * 
 * Funções auxiliares para datas, timestamps e cálculos comuns.
 */

import { serverTimestamp } from 'firebase/firestore';

/**
 * Adiciona meses a uma data, tratando casos especiais como fevereiro
 * @param {Date} date - Data inicial
 * @param {number} months - Quantidade de meses a adicionar
 * @returns {Date} Nova data com meses adicionados
 */
export const addMonthsToDate = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);

  // Ajusta se o dia não existe no novo mês (ex: 31 de janeiro -> fevereiro)
  if (result.getDate() !== date.getDate()) {
    result.setDate(0); // Último dia do mês anterior
  }

  return result;
};

/**
 * Formata um valor como moeda BRL
 * @param {number} value - Valor a formatar
 * @returns {string} Valor formatado em BRL
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data no formato pt-BR
 * @param {Date | string} date - Data a formatar
 * @returns {string} Data formatada (dd/mm/yyyy)
 */
export const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
};

/**
 * Retorna o timestamp do servidor do Firebase
 * @returns {Object} Server timestamp do Firestore
 */
export const getServerTimestamp = () => {
  return serverTimestamp();
};

/**
 * Gera um UUID simples (não criptográfico, apenas para referência)
 * @returns {string} ID único
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
