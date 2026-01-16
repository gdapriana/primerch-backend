export interface SuccessResponseType {
  status: number;
  success: true;
  message: string;
  result?: any;
}

export interface ErrorResponseType {
  status: number;
  success: false;
  message: string;
  result?: any;
}

export interface PaginationType {
  take: number;
  hasNext: boolean;
  nextCursor?: string | null;
  totalFiltered: number;
  totalAll: number;
}
