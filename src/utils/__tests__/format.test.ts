import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatOrderStatus } from '../format';

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date, 'dd/MM/yyyy')).toContain('15/01/2024');
    });

    it('should handle null and undefined', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
    });
  });

  describe('formatOrderStatus', () => {
    it('should format status correctly', () => {
      expect(formatOrderStatus('pending')).toBe('Pendente');
      expect(formatOrderStatus('completed')).toBe('Concluído');
      expect(formatOrderStatus('processing')).toBe('Processando');
      expect(formatOrderStatus('cancelled')).toBe('Cancelado');
    });

    it('should handle unknown status', () => {
      expect(formatOrderStatus('unknown')).toBe('unknown');
    });
  });
});
