// This file is auto-generated by @hey-api/openapi-ts

export type Foo = {
    foo: Array<Bar>;
};

export type Bar = {
    foo: Array<Baz>;
    bar: 'foo' | 'bar' | 'baz';
};

export type Baz = Qux & {
    id: 'Baz';
} & {
    foo: number;
    bar: Date;
    baz: 'foo' | 'bar' | 'baz';
    qux: number;
};

export type Qux = {
    foo: number;
    bar: number;
    baz?: Date;
    id: string;
};

export type GetFooData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/foo';
};

export type GetFooResponses = {
    /**
     * OK
     */
    200: Foo;
};

export type GetFooResponse = GetFooResponses[keyof GetFooResponses];

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};