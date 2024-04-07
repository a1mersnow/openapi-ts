import { Model } from '../../openApi';
import { Config } from '../../types/config';
import { enumUnionType } from '../enum';
import { escapeComment } from '../escape';
import { modelIsRequired } from '../required';
import { unique } from '../unique';

const base = (model: Model, config: Config) => {
    if (model.base === 'binary') {
        return 'Blob | File';
    } else {
        if (config.useDateType && model.format === 'date-time') {
            return 'Date';
        } else {
            return model.base;
        }
    }
};

const typeReference = (model: Model, config: Config) => `${base(model, config)}${model.isNullable ? ' | null' : ''}`;

const typeArray = (model: Model, config: Config): string | undefined => {
    if (
        model.export === 'array' &&
        model.link &&
        model.maxItems &&
        model.minItems &&
        model.maxItems === model.minItems
    ) {
        return `[${toType(model.link, config, 'exact')}]${model.isNullable ? ' | null' : ''}`;
    } else {
        if (model.link) {
            return `Array<${toType(model.link, config)}>${model.isNullable ? ' | null' : ''}`;
        } else {
            return `Array<${base(model, config)}>${model.isNullable ? ' | null' : ''}`;
        }
    }
};

const typeEnum = (model: Model) => `${enumUnionType(model.enum)}${model.isNullable ? ' | null' : ''}`;

const typeDict = (model: Model, config: Config): string => {
    if (model.link) {
        return `Record<string, ${toType(model.link, config)}>${model.isNullable ? ' | null' : ''}`;
    } else {
        return `Record<string, ${base(model, config)}>${model.isNullable ? ' | null' : ''}`;
    }
};

const typeUnion = (model: Model, config: Config, filterProperties: 'exact' | undefined = undefined) => {
    const models = model.properties;
    const types = models
        .map(m => toType(m, config))
        .filter((...args) => filterProperties === 'exact' || unique(...args));
    const union = types.join(filterProperties === 'exact' ? ', ' : ' | ');
    const unionString = types.length > 1 && types.length !== models.length ? `(${union})` : union;
    return `${unionString}${model.isNullable ? ' | null' : ''}`;
};

const typeIntersect = (model: Model, config: Config) => {
    const types = model.properties.map(m => toType(m, config)).filter(unique);
    let typesString = types.join(' & ');
    if (types.length > 1) {
        typesString = `(${typesString})`;
    }
    return `${typesString}${model.isNullable ? ' | null' : ''}`;
};

const typeInterface = (model: Model, config: Config) => {
    if (model.properties.length) {
        return `{
            ${model.properties
                .map(m => {
                    let s: string = '';
                    if (m.description || m.deprecated) {
                        s += '/**\n';
                        if (m.description) {
                            s += ` * ${escapeComment(m.description)}`;
                        }
                        if (m.deprecated) {
                            s += ` * @deprecated`;
                        }
                        s += ' */';
                    }
                    s += `${m.isReadOnly ? 'readonly ' : ''}${m.name}${modelIsRequired(config, m)}: ${toType(m, config)}`;
                    return s;
                })
                .join('\n')}
        }${model.isNullable ? ' | null' : ''}`;
    } else {
        return 'unknown';
    }
};

export const toType = (
    model: Model,
    config: Config,
    filterProperties: 'exact' | undefined = undefined
): string | undefined => {
    switch (model.export) {
        case 'interface':
            return typeInterface(model, config);
        case 'enum':
            return typeEnum(model);
        case 'array':
            return typeArray(model, config);
        case 'dictionary':
            return typeDict(model, config);
        case 'one-of':
        case 'any-of':
            return typeUnion(model, config, filterProperties);
        case 'all-of':
            return typeIntersect(model, config);
        case 'reference':
        default:
            return typeReference(model, config);
    }
};
