export class ApiResponse {
  data?: any;
  message?: string;

  constructor(data = {}, message = '') {
    this.data = data;
    this.message = message;
  }
}
