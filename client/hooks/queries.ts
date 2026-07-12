import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// ===== Dashboard =====
export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/kpis");
      return data.data;
    },
    staleTime: 30000, // 30 seconds for real-time feel
    refetchInterval: 30000,
  });
};

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/charts");
      return data.data;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

// ===== Vehicles =====
export const useVehicles = (filters?: any) => {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/vehicles", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useVehicleById = (id: string) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/vehicles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/vehicles", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await apiClient.put(`/vehicles/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

// ===== Drivers =====
export const useDrivers = (filters?: any) => {
  return useQuery({
    queryKey: ["drivers", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/drivers", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverById = (id: string) => {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/drivers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/drivers", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await apiClient.put(`/drivers/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

// ===== Trips =====
export const useTrips = (filters?: any) => {
  return useQuery({
    queryKey: ["trips", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/trips", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/trips", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await apiClient.patch(`/trips/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};

// ===== Maintenance =====
export const useMaintenance = (filters?: any) => {
  return useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/maintenance", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/maintenance", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await apiClient.put(`/maintenance/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
  });
};

// ===== Fuel =====
export const useFuelLogs = (filters?: any) => {
  return useQuery({
    queryKey: ["fuel", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/fuel-logs", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFuelLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/fuel-logs", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ===== Expenses =====
export const useExpenses = (filters?: any) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/expenses", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/expenses", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// ===== Analytics =====
export const useAnalyticsMetrics = (filters?: any) => {
  return useQuery({
    queryKey: ["analytics", "metrics", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/metrics", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnalyticsCharts = (filters?: any) => {
  return useQuery({
    queryKey: ["analytics", "charts", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/charts", { params: filters });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ===== Reports =====
export const useReports = (filters?: any) => {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports", { params: filters });
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // Reports change less frequently
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await apiClient.post("/reports/generate", params);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// ===== Audit Logs =====
export const useAuditLogs = (filters?: any) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/audit-logs", { params: filters });
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};
