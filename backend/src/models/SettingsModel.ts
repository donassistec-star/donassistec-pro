import pool from "../config/database";
import mysql2 from "mysql2";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface SettingsMap {
  [key: string]: string | boolean | number;
}

const SETTING_DESCRIPTIONS: Record<string, string> = {
  showNavHome: "Exibir link Home no menu principal",
  showNavCatalog: "Exibir link Catálogo no menu principal",
  showNavFavorites: "Exibir link Favoritos no menu principal",
  showNavAbout: "Exibir link Sobre no menu principal",
  showNavHelp: "Exibir link Ajuda no menu principal",
  showNavServices: "Exibir link Serviços no menu principal",
  showNavBrands: "Exibir link Marcas no menu principal",
  showNavContact: "Exibir link Contato no menu principal",
  showAdminAccessButton: "Exibir ícone Admin no cabeçalho",
  showHeaderPhone: "Exibir telefone no cabeçalho",
  showRetailerAreaButton: "Exibir botão Área do Lojista no cabeçalho",
  showCompanyTradeName: "Exibir nome fantasia no cabeçalho e rodapé público",
};

class SettingsModel {
  async getAll(): Promise<SettingsMap> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM system_settings"
    );

    const settings: SettingsMap = {};
    
    rows.forEach((row) => {
      let value: string | boolean | number = row.setting_value;
      
      // Converter strings booleanas para boolean
      if (value === "true") value = true;
      else if (value === "false") value = false;
      // Tentar converter para número se possível
      else if (!isNaN(Number(value)) && value !== "") {
        value = Number(value);
      }
      
      settings[row.setting_key] = value;
    });

    return settings;
  }

  async getByKey(key: string): Promise<string | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT setting_value FROM system_settings WHERE setting_key = ?",
      [key]
    );

    if (rows.length === 0) return null;
    return rows[0].setting_value;
  }

  async update(key: string, value: string | boolean | number): Promise<boolean> {
    const stringValue = String(value);
    
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?",
      [stringValue, key]
    );

    return result.affectedRows > 0;
  }

  async updateMany(settings: SettingsMap, userId?: string, userEmail?: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      try {
        for (const [key, value] of Object.entries(settings)) {
          const stringValue = String(value);
          const settingId = key
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
          
          // Buscar valor antigo antes de atualizar
          const [oldRows] = await connection.execute<mysql2.RowDataPacket[]>(
            "SELECT setting_value FROM system_settings WHERE setting_key = ?",
            [key]
          );
          
          const oldValue = oldRows.length > 0 ? oldRows[0].setting_value : null;
          
          // Atualizar configuração existente ou criar a nova chave
          if (oldRows.length > 0) {
            await connection.execute(
              "UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?",
              [stringValue, key]
            );
          } else {
            await connection.execute(
              `INSERT INTO system_settings (id, setting_key, setting_value, description)
               VALUES (?, ?, ?, ?)`,
              [settingId, key, stringValue, SETTING_DESCRIPTIONS[key] || key]
            );
          }
          
          // Registrar histórico se valor mudou e se temos userId
          if (oldValue !== stringValue && userId) {
            try {
              await connection.execute(
                `INSERT INTO settings_history (setting_key, old_value, new_value, changed_by, changed_by_email) 
                 VALUES (?, ?, ?, ?, ?)`,
                [key, oldValue || null, stringValue, userId, userEmail || null]
              );
            } catch (historyError) {
              // Se a tabela de histórico não existir, apenas logar erro mas continuar
              console.warn("Erro ao registrar histórico de configuração:", historyError);
            }
          }
        }

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } finally {
      connection.release();
    }
  }

  /** Chaves permitidas para leitura pública (sem autenticação) */
  private static readonly PUBLIC_KEYS = [
    "contactPhone", "contactPhoneRaw", "contactEmail", "contactAddress", "contactWhatsApp",
    "contactCep", "contactCity", "contactState", "whatsappContactMessage",
    "brandingLogoUrl", "brandingLogoFavicon", "brandingPrimaryColor", "brandingSecondaryColor",
    "companyTradeName", "companyDescription", "companySlogan", "companyLegalName", "companyWebsite",
    "showCompanyTradeName",
    "siteName", "siteDescription", "supportPhone", "supportEmail",
    "socialInstagram", "socialFacebook", "socialYoutube", "socialLinkedin", "socialTwitter", "socialTikTok",
    "seoTitle", "seoDescription", "seoOgImage", "seoKeywords",
    "googleAnalyticsId", "facebookPixelId", "whatsappEnabled", "whatsappNumber",
    "showNavHome", "showNavCatalog", "showNavFavorites", "showNavAbout", "showNavHelp",
    "showNavServices", "showNavBrands", "showNavContact", "showAdminAccessButton",
    "showHeaderPhone", "showRetailerAreaButton",
  ];

  async getPublic(): Promise<SettingsMap> {
    if (SettingsModel.PUBLIC_KEYS.length === 0) return {};
    const placeholders = SettingsModel.PUBLIC_KEYS.map(() => "?").join(",");
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
      SettingsModel.PUBLIC_KEYS
    );
    const settings: SettingsMap = {};
    rows.forEach((row) => {
      let value: string | boolean | number = row.setting_value;
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);
      settings[row.setting_key] = value;
    });
    return settings;
  }

  async getHistory(settingKey?: string, limit: number = 50): Promise<any[]> {
    const connection = await pool.getConnection();
    try {
      let query = "SELECT * FROM settings_history";
      const params: any[] = [];
      
      if (settingKey) {
        query += " WHERE setting_key = ?";
        params.push(settingKey);
      }
      
      query += " ORDER BY changed_at DESC LIMIT ?";
      params.push(limit);
      
      const [rows] = await connection.execute<mysql2.RowDataPacket[]>(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default new SettingsModel();
