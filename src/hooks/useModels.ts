import { useState, useEffect } from "react";
import { PhoneModel } from "@/data/models";
import { modelsService } from "@/services/modelsService";

export const useModels = (filters?: {
  brand?: string[];
  availability?: string[];
  premium?: boolean;
  popular?: boolean;
  service?: string[];
  search?: string;
}) => {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await modelsService.getAll(filters);
        setModels(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar modelos");
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [JSON.stringify(filters)]);

  return { models, loading, error, refetch: () => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await modelsService.getAll(filters);
        setModels(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar modelos");
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }};
};

export const useModel = (id: string | undefined) => {
  const [model, setModel] = useState<PhoneModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchModel = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await modelsService.getById(id);
        setModel(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar modelo");
        setModel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  return { model, loading, error };
};
