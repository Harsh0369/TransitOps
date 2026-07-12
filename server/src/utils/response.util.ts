export const successResponse = <T>(message: string, data?: T, meta?: any) => {
  return {
    success: true,
    message,
    data,
    meta,
  };
};

export const errorResponse = (message: string, errors?: any) => {
  return {
    success: false,
    message,
    errors,
  };
};
