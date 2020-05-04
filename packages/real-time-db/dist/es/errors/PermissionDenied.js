export class PermissionDenied extends Error {
    constructor(e, context) {
        super(context ? context + '.\n' + e.message : e.message);
        this.stack = e.stack;
        const name = 'RealTimeDb/permission-denied';
        if (e.name === 'Error') {
            this.name = name;
        }
        this.code = name.split('/')[1];
        this.stack = e.stack;
    }
}
