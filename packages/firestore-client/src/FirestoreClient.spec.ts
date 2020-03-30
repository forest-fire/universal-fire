import { expect } from 'chai';
import { FirestoreClient } from '.';

describe('FirestoreClient', () => {
  it('should be defined', () => {
    expect(FirestoreClient).to.exist;
  });
});
