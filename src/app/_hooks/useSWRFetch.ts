'use client';

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationConfiguration, SWRMutationResponse } from 'swr/mutation';

/**
 * Default fetcher function for SWR
 */
const defaultFetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Add extra info to the error object
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * Custom hook for data fetching with SWR
 * 
 * @example
 * ```tsx
 * const { data, error, isLoading } = useFetch<User[]>('/api/users');
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * 
 * return (
 *   <ul>
 *     {data.map(user => (
 *       <li key={user.id}>{user.name}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useFetch<Data = any, Error = any>(
  url: string | null,
  options?: SWRConfiguration
): SWRResponse<Data, Error> & { isLoading: boolean } {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Data, Error>(
    url,
    defaultFetcher,
    {
      revalidateOnFocus: false,
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Mutation fetcher for useMutation
 */
async function mutationFetcher<T>(
  url: string,
  { arg }: { arg: { method: string; body?: any; headers?: HeadersInit; url?: string } }
): Promise<T> {
  const { method, body, headers = {}, url: overrideUrl } = arg;
  const fetchUrl = overrideUrl || url;
  
  const response = await fetch(fetchUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = new Error('An error occurred while mutating the data.');
    // Add extra info to the error object
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
}

/**
 * Custom hook for data mutations with SWR
 * 
 * @example
 * ```tsx
 * const { trigger, isMutating, error } = useMutation<User>('/api/users');
 * 
 * const handleSubmit = async (formData) => {
 *   try {
 *     const result = await trigger({ 
 *       method: 'POST', 
 *       body: formData 
 *     });
 *     console.log('Created user:', result);
 *   } catch (error) {
 *     console.error('Failed to create user:', error);
 *   }
 * };
 * ```
 */
export function useMutation<Data = any, Error = any>(
  url: string,
  options?: SWRMutationConfiguration<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }>
): SWRMutationResponse<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }> {
  return useSWRMutation<Data, Error, string, { method: string; body?: any; headers?: HeadersInit; url?: string }>(
    url,
    mutationFetcher,
    options
  );
}

/**
 * Optimistic update helper for useMutation
 */
export function createOptimisticData<T>(
  currentData: T[] | undefined,
  newItem: T,
  idField: keyof T = 'id' as keyof T
): T[] {
  if (!currentData) return [newItem];
  return [...currentData, newItem];
}

/**
 * Optimistic update helper for updating an item
 */
export function updateOptimisticData<T>(
  currentData: T[] | undefined,
  updatedItem: Partial<T> & { [key: string]: any },
  idField: keyof T = 'id' as keyof T
): T[] {
  if (!currentData) return [];
  
  return currentData.map(item => 
    item[idField] === updatedItem[idField] 
      ? { ...item, ...updatedItem } 
      : item
  );
}

/**
 * Optimistic update helper for deleting an item
 */
export function deleteOptimisticData<T>(
  currentData: T[] | undefined,
  idToDelete: string | number,
  idField: keyof T = 'id' as keyof T
): T[] {
  if (!currentData) return [];
  
  return currentData.filter(item => item[idField] !== idToDelete);
} 