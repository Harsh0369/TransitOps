import { AxiosError } from 'axios';
import { useState } from 'react';

interface ValidationError {
  [key: string]: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError;
  data?: {
    errors?: ValidationError;
  };
}

export function useFormError() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationError>({});

  const handleError = (err: unknown) => {
    // Reset previous errors
    setError(null);
    setFieldErrors({});

    if (err instanceof AxiosError) {
      const responseData = err.response?.data as ApiErrorResponse;

      // Set main error message
      if (responseData?.message) {
        setError(responseData.message);
      } else if (err.response?.status === 400) {
        setError('Invalid input. Please check your fields.');
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to perform this action.');
      } else if (err.response?.status === 404) {
        setError('Resource not found.');
      } else if (err.response?.status === 409) {
        setError('This resource already exists or there is a conflict.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'An error occurred');
      }

      // Set field-level errors
      const errors = responseData?.errors || responseData?.data?.errors;
      if (errors && typeof errors === 'object') {
        setFieldErrors(errors);
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const clearError = () => {
    setError(null);
    setFieldErrors({});
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return {
    error,
    fieldErrors,
    handleError,
    clearError,
    clearFieldError,
  };
}
