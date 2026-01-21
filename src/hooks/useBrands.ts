import { useState, useEffect } from "react";
import { Brand } from "@/data/models";
import { brandsService } from "@/services/modelsService";

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await brandsService.getAll();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar marcas");
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error, refetch: () => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await brandsService.getAll();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar marcas");
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }};
};
