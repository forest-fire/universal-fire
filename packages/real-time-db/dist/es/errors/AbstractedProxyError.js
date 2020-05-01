import { parseStack } from 'common-types';
export class AbstractedProxyError extends Error {
    constructor(e, typeSubtype = null, context) {
        super('');
        this.stack = e.stack;
        const parts = (typeSubtype || `RealTimeDb/${e.name || e.code || e.type || 'unknown'}`).split('/');
        const [type, subType] = parts.length === 2 ? parts : ['RealTimeDb', parts[0]];
        this.name = `${type}/${subType}`;
        this.code = `${subType}`;
        this.stack = e.stack;
        try {
            this.stackFrames = parseStack(this.stack, {
                ignorePatterns: ['timers.js', 'mocha/lib', 'runners/node']
            });
        }
        catch (e) {
            // ignore if there was an error parsing
        }
        const shortStack = this.stackFrames
            ? this.stackFrames
                .slice(0, Math.min(3, this.stackFrames.length - 1))
                .map(i => `${i.shortPath}/${i.fn}::${i.line}`)
            : '';
        this.message = context
            ? `${e.name ? `[Proxy of ${e.name}]` : ''}` +
                context +
                '.\n' +
                e.message +
                `\n${shortStack}`
            : `${e.name ? `[Proxy of ${e.name}]` : ''}[ ${type}/${subType}]: ${e.message}\n${shortStack}`;
    }
}
