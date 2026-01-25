import { useState, useEffect } from "react";
import { settingsService, SystemSettings } from "@/services/settingsService";

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getPublic();
        setSettings(data);
      } catch {
        // getPublic não exige login; falha silenciosa com defaults
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
};
