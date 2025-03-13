'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSpinner } from '@/hooks/useSpinner';
import { debounce } from '@/utils/debounce';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface WorkoutFiltersProps {
  onFilterChange?: (filters: WorkoutFilters) => void;
}

export interface WorkoutFilters {
  search: string;
  customerId?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: 'name' | 'date' | 'customer';
  sortOrder?: 'asc' | 'desc';
}

export default function WorkoutFilters({ onFilterChange }: WorkoutFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, isCoach } = useAuth();
  const { showSpinner, hideSpinner } = useSpinner();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<WorkoutFilters>({
    search: searchParams.get('search') || '',
    customerId: searchParams.get('customerId') || undefined,
    status: (searchParams.get('status') as WorkoutFilters['status']) || 'active',
    sortBy: (searchParams.get('sortBy') as WorkoutFilters['sortBy']) || 'date',
    sortOrder: (searchParams.get('sortOrder') as WorkoutFilters['sortOrder']) || 'desc',
  });

  // Fetch customers for the dropdown (only for admins and coaches)
  useEffect(() => {
    if (!isAdmin && !isCoach) return;
    
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [isAdmin, isCoach]);

  // Update URL when filters change
  const updateUrl = (newFilters: WorkoutFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.customerId) params.set('customerId', newFilters.customerId);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
    
    router.push(`?${params.toString()}`);
    
    // Call the callback if provided
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, 300);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'search') {
      debouncedSearch(value);
    } else {
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);
      updateUrl(newFilters);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Workouts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search workouts..."
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        {(isAdmin || isCoach) && (
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium mb-1">
              Customer
            </label>
            <select
              id="customerId"
              name="customerId"
              value={filters.customerId || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status || 'active'}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium mb-1">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy || 'date'}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              {(isAdmin || isCoach) && (
                <option value="customer">Customer</option>
              )}
            </select>
            
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder || 'desc'}
              onChange={handleChange}
              className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 