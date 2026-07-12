export const successResponse = <T>(message: string, data?: T) => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, errors?: any) => {
  return {
    success: false,
    message,
    errors,
  };
};
