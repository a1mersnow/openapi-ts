// This file is auto-generated by @hey-api/openapi-ts

export enum Type {
    FOO = 'foo',
    BAR = 'bar'
}

export type Foo = {
    type?: 'foo' | 'bar';
};

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};