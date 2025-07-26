import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { ProductoFormValues } from "../validations/productoSchema";

export const useProductos = () =>{
    return useQuery({
        queryKey: ['productos'],
        queryFn: async () => {
            const { data } = await apiClient.get('/productos');
            return data;
        },
    });
};

export const useProducto = (id: number) => {
    return useQuery({
        queryKey: ['producto, id'],
        queryFn: async () => {
            const { data } = await apiClient.get(`/productos/${id}`);
            return data;
        }, 
    });
};

export const useCreateProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (producto: ProductoFormValues) => 
        apiClient.post('/productos', producto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productos'] });
      },
    });
  };
  
  export const useUpdateProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...producto }: { id: number } & ProductoFormValues) => 
        apiClient.put(`/productos/${id}`, producto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productos'] });
      },
    });
  };
  
  export const useDeleteProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => apiClient.delete(`/productos/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['productos'] });
      },
    });
  };