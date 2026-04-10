/**
 * Utilitários de validação para formulários
 */

export const validation = {
  /**
   * Remove caracteres nao numericos de um documento brasileiro
   */
  cleanDocument(document: string): string {
    return document.replace(/[^\d]/g, "");
  },

  /**
   * Identifica se o documento informado parece CPF ou CNPJ
   */
  getDocumentType(document: string): "cpf" | "cnpj" | null {
    const cleanDocument = this.cleanDocument(document);
    if (cleanDocument.length === 11) return "cpf";
    if (cleanDocument.length === 14) return "cnpj";
    return null;
  },

  /**
   * Valida formato de CPF (basico - apenas quantidade de digitos)
   */
  isValidCPF(cpf: string): boolean {
    const cleanCPF = this.cleanDocument(cpf);
    return cleanCPF.length === 11;
  },

  /**
   * Valida formato de email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida formato de CNPJ (básico - apenas formato)
   */
  isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = this.cleanDocument(cnpj);
    return cleanCNPJ.length === 14;
  },

  /**
   * Valida CPF ou CNPJ (basico - apenas quantidade de digitos)
   */
  isValidBrazilianDocument(document: string): boolean {
    const documentType = this.getDocumentType(document);
    if (documentType === "cpf") return this.isValidCPF(document);
    if (documentType === "cnpj") return this.isValidCNPJ(document);
    return false;
  },

  /**
   * Valida formato de telefone brasileiro
   */
  isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    // Aceita telefones com 10 ou 11 dígitos (fixo ou celular)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  /**
   * Formata CPF
   */
  formatCPF(cpf: string): string {
    const cleanCPF = this.cleanDocument(cpf).slice(0, 11);
    if (cleanCPF.length <= 3) return cleanCPF;
    if (cleanCPF.length <= 6) return cleanCPF.replace(/^(\d{3})(\d+)/, "$1.$2");
    if (cleanCPF.length <= 9) return cleanCPF.replace(/^(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
  },

  /**
   * Formata CNPJ
   */
  formatCNPJ(cnpj: string): string {
    const cleanCNPJ = this.cleanDocument(cnpj).slice(0, 14);
    if (cleanCNPJ.length <= 2) return cleanCNPJ;
    if (cleanCNPJ.length <= 5) return cleanCNPJ.replace(/^(\d{2})(\d+)/, "$1.$2");
    if (cleanCNPJ.length <= 8) return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (cleanCNPJ.length <= 12) return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, "$1.$2.$3/$4-$5");
  },

  /**
   * Formata CPF ou CNPJ automaticamente conforme a quantidade de digitos
   */
  formatBrazilianDocument(document: string): string {
    const cleanDocument = this.cleanDocument(document);
    if (cleanDocument.length <= 11) {
      return this.formatCPF(cleanDocument);
    }
    return this.formatCNPJ(cleanDocument);
  },

  /**
   * Formata telefone
   */
  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    } else if (cleanPhone.length === 11) {
      return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    return phone;
  },

  /**
   * Valida senha com regras configuráveis
   */
  isValidPassword(
    password: string, 
    options?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    }
  ): { valid: boolean; message?: string } {
    const minLength = options?.minLength || 6;
    const requireUppercase = options?.requireUppercase !== false;
    const requireNumbers = options?.requireNumbers !== false;
    const requireSymbols = options?.requireSymbols || false;

    if (password.length < minLength) {
      return { 
        valid: false, 
        message: `A senha deve ter no mínimo ${minLength} caracteres` 
      };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { 
        valid: false, 
        message: "A senha deve conter pelo menos uma letra maiúscula" 
      };
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      return { 
        valid: false, 
        message: "A senha deve conter pelo menos um número" 
      };
    }

    if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { 
        valid: false, 
        message: "A senha deve conter pelo menos um símbolo especial" 
      };
    }

    return { valid: true };
  },

  /**
   * Valida se senhas coincidem
   */
  passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  },

  /**
   * Valida URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida porta (1-65535)
   */
  isValidPort(port: number | string): boolean {
    const portNum = typeof port === 'string' ? parseInt(port) : port;
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  },

  /**
   * Valida PIX key
   */
  isValidPixKey(key: string, type: 'email' | 'cpf' | 'cnpj' | 'random'): boolean {
    const cleanKey = key.replace(/[^\d@a-zA-Z]/g, '');
    
    switch (type) {
      case 'email':
        return this.isValidEmail(cleanKey);
      case 'cpf':
        return cleanKey.length === 11 && /^\d+$/.test(cleanKey);
      case 'cnpj':
        return cleanKey.length === 14 && /^\d+$/.test(cleanKey);
      case 'random':
        return cleanKey.length === 36; // UUID format
      default:
        return false;
    }
  },

  /**
   * Valida WhatsApp number. Aceita string ou number (ex.: valor da API).
   */
  isValidWhatsAppNumber(number: string | number | null | undefined): boolean {
    const cleanNumber = this.cleanWhatsAppNumber(number);
    // Formato: código do país (1-3 dígitos) + DDD + número
    // Exemplo: 5511999999999 (55 = Brasil, 11 = DDD, 999999999 = número)
    return cleanNumber.length >= 10 && cleanNumber.length <= 15 && /^\d+$/.test(cleanNumber);
  },

  /**
   * Limpa número do WhatsApp (remove caracteres especiais e espaços).
   * Aceita string, number, null ou undefined (ex.: valor vindo da API como número).
   */
  cleanWhatsAppNumber(number: string | number | null | undefined): string {
    if (number == null) return '';
    return String(number).replace(/[^\d]/g, '');
  },

  /**
   * Gera URL do WhatsApp corretamente formatada
   */
  generateWhatsAppUrl(number: string | number | null | undefined, message: string): string {
    const cleanNumber = this.cleanWhatsAppNumber(number);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  },

  /**
   * Valida número de caracteres (para SEO)
   */
  validateCharacterCount(text: string, min: number, max: number): { valid: boolean; message?: string } {
    if (text.length < min) {
      return { valid: false, message: `Mínimo de ${min} caracteres` };
    }
    if (text.length > max) {
      return { valid: false, message: `Máximo de ${max} caracteres` };
    }
    return { valid: true };
  },

  /**
   * Formata CEP
   */
  formatCEP(cep: string): string {
    const cleanCEP = cep.replace(/[^\d]/g, "");
    if (cleanCEP.length !== 8) return cep;
    return cleanCEP.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  },

  /**
   * Valida formato de CEP (básico - apenas formato)
   */
  isValidCEP(cep: string): boolean {
    const cleanCEP = cep.replace(/[^\d]/g, "");
    return cleanCEP.length === 8;
  },
};

/**
 * Interface para dados de endereço retornados pela API ViaCEP
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Busca endereço por CEP usando a API ViaCEP
 */
export const buscaCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  const cleanCEP = cep.replace(/[^\d]/g, "");
  
  if (cleanCEP.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data: ViaCEPResponse = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};
