import { useState, useEffect } from "react";
import { servicesService } from "@/services/servicesService";
import type { Service } from "@/services/servicesService";

export const useServices = (activeOnly = true) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesService.getAll(activeOnly);
        setServices(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao carregar serviços");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [activeOnly]);

  return {
    services,
    loading,
    error,
    refetch: () => {
      const fetchServices = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await servicesService.getAll(activeOnly);
          setServices(data);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Erro ao carregar serviços");
          setServices([]);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    },
  };
};
