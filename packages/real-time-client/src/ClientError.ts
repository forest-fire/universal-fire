import { FireError } from '@forest-fire/utility';

export class ClientError extends FireError {
  public kind: string = 'RealTimeClient';
  constructor(
    message: string,
    classification: string = 'RealTimeClient/unknown',
    statusCode: number = 400
  ) {
    super(message, classification, 400);
  }
}
