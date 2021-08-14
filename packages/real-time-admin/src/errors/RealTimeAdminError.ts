import { FireError } from '@forest-fire/utility';

export class RealTimeAdminError extends FireError {
  kind = 'RealTimeAdminError';
  constructor(
    message: string,
    classification = 'RealTimeAdmin/error',
    statusCode = 400
  ) {
    super(message, classification, statusCode);
  }
}
