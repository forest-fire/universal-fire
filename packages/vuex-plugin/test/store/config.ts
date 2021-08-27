import { AsyncMockData } from '~/index';

import { IDictionary } from 'common-types';
import { IMockConfig } from 'universal-fire';

const defaultData = async () => ({});

export const config = (data?: IDictionary | AsyncMockData) => {
  const mockConfig: IMockConfig = {
    mocking: true,
    mockAuth: {
      providers: ['emailPassword'],
      users: [{ email: 'test@test.com', password: 'foobar', uid: 'foobar', emailVerified: true }],
    },
    mockData: data || defaultData || {},
  };

  return mockConfig;
};
