import { IDictionary } from 'common-types';
import { createError } from 'brilliant-errors';

export function handleError(
  err: IDictionary,
  method: string,
  props: IDictionary = {}
) {
  const name: string =
    err.code || err.name !== 'Error' ? err.name : 'RealTimeDb';
  const RealTimeDbError = createError('RealTimeDbError', 'real-time-db');
  const e = new RealTimeDbError(
    `An error [ ${name} ] occurred in RealTimeDb while calling the ${method}() method. ${
      props ? `\n${JSON.stringify(props, null, 2)}` : ''
    }`,
    `RealTimeDb/${name}`
  );
  Object.assign(e.name, name);
  Object.assign(e.stack, err.stack);

  throw e;
}
