

export interface IResponse<T=unknown> {
  message?: boolean;
  status?: number;
  data?: T;
  meta?: any;
}
