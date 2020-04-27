import { FireError } from '@forest-fire/utility';

export class RealTimeAdminError extends FireError {
  kind = 'RealTimeAdminError';
  constructor(
    message: string,
    classification: string = 'RealTimeAdmin/error',
    statusCode: number = 400
  ) {
    super(message, classification, statusCode);
  }
}
