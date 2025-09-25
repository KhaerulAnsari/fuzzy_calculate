import type { Response } from "express";

interface ApiResponse {
  error: boolean;
  message: string;
  status: number;
  data?: any;
}

const sendSuccess = (res : Response, status = 200, message = "Success", data = null) => {
  const response: ApiResponse = {
    error: false,
    status: status,
    message: message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(status).send(response);
};

export default sendSuccess;