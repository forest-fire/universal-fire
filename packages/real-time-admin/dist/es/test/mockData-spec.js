import { RealTimeAdmin } from '../src';
describe('mockData', () => {
    it('mockData option initializes a mock database state', async () => {
        const db = await RealTimeAdmin.connect({
            mocking: true,
            mockData: {
                people: {
                    1234: {
                        name: 'Foobar'
                    }
                }
            }
        });
    });
});
//# sourceMappingURL=mockData-spec.js.map