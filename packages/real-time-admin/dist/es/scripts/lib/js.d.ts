export interface IJSTranspileOptions {
    scope?: string;
    configFile?: string;
}
export declare function transpileJavascript(options?: IJSTranspileOptions): Promise<void>;
export declare function clearTranspiledJS(): Promise<unknown>;
export declare function lintSource(): Promise<string>;
