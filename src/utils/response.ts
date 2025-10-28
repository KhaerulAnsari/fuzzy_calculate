import type { Response } from "express";

interface ApiResponse {
  error: boolean;
  message: string;
  status: number;
  data?: any;
}

const sendResponse = (res : Response, status = 200, message = "Success", data = null, error = false) => {
  const response: ApiResponse = {
    error: error,
    status: status,
    message: message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(status).send(response);
};

export default sendResponse;