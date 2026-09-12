export interface Position {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount: number;
  createdDate: string;
}
export interface CreatePositionDTO {
  code: string;
  name: string;
  description: string;

}
 
export interface UpdatePositionDTO {
    id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean
}
 
export interface PositionResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  traceId: string;
  data: Position[];
  errors: string[];
}
 
export interface SinglePositionResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  traceId: string;
  data: Position;
  errors: string[];
}