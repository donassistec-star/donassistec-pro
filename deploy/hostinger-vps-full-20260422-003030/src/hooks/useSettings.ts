import { useState, useEffect } from "react";
import { settingsService, SystemSettings } from "@/services/settingsService";

const PUBLIC_SETTINGS_UPDATED_EVENT = "settings:public-updated";

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const data = await settingsService.getPublic();
        if (active) {
          setSettings(data);
        }
      } catch {
        // getPublic não exige login; falha silenciosa com defaults
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    const handlePublicSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener(PUBLIC_SETTINGS_UPDATED_EVENT, handlePublicSettingsUpdated);

    return () => {
      active = false;
      window.removeEventListener(PUBLIC_SETTINGS_UPDATED_EVENT, handlePublicSettingsUpdated);
    };
  }, []);

  return { settings, loading };
};
