import collect from 'collect.js';
import { Collection as CollectionClass } from 'collect.js';
import { AxiosInstance } from 'axios';
import query from './query';

const methodSteps: string[] = ["chunk", "shuffle", "splice", "sortBy", "map", "reverse", "groupBy", "implode", "keyBy", "keys",
    "mapToDictionary", "mapWithKeys", "nth", "skipUntil", "skipWhile", "takeUntil", "takeWhile", "unique"]

const methodStepsSQL: string[] = ["forPage", "sortByDesc", "sortBy", "skip", "take", "splice", "whereBetween", "whereIn", "whereNotBetween", "whereNotIn"]

//direct get result methods
const methodFinal: string[] = ["avg", "count", "countBy", "dd", "each", "every", "filter", "first", "firstWhere", "isEmpty", "isNotEmpty",
    "last", "mapToGroups", "max", "median", "min", "mode", "contains", "sole", "sort", "split", "sum", "toJson"]

class Collection<Item> {
    [key: string]: any;

    private filters: any;
    private data_path: string;
    private axios: AxiosInstance;
    public limit: number | undefined;
    private _sort: string | undefined;
    private _sortDesc: boolean = false;
    private offset: number | undefined;

    public steps: Array<any>;
    private already_limit: boolean = false;
    private already_offset: boolean = false;
    private fields: Object;

    constructor(data_path: string, fields: Object, axios: AxiosInstance) {
        this.data_path = data_path;
        this.axios = axios;
        this.filters = {};
        this.steps = [];
        this.fields = fields;
    }

    avgerage(key?: string | undefined) {
        return this.avg(key);
    }

    async first<V>(fn?: (item: Item, key: any) => boolean, defaultValue?: ((...any: any[]) => V | Item) | V | Item) {
        let clone = this.clone();

        if (!fn) {
            clone = clone.take(1);
        }

        return (await clone.processData()).first(fn, defaultValue);
    }

    dataPath(path: string) {
        //clone
        const clone = this.clone();
        clone.data_path = path;
        return clone;
    }

    clone() {
        const clone = Object.create(this);
        clone.steps = [...this.steps];
        return clone as Collection<Item>;
    }

    where(field: string, operator: any, value?: any) {
        if (arguments.length === 2) {
            value = operator;
            operator = '==';
        }

        this.steps.push({ type: 'where', field, operator, value });

        return this;
    }

    buildArgs() {
        let args: any = {};

        if (Object.keys(this.filters).length > 0) {
            args.filters = this.filters;
        }
        if (this._sort) {
            args.sort = this._sort;
            if (this._sortDesc) {
                args.sort += ':desc';
            }
        }

        return args;
    }


    async fetchData() {
        let q: any = {};
        q.__args = this.buildArgs();
        q.data = this.fields;
        if (this.already_limit) {
            q.data.__args = q.data.__args || {};
            q.data.__args.limit = this.limit;
        }

        if (this.already_offset) {
            q.data.__args = q.data.__args || {};
            q.data.__args.offset = this.offset;
        }


        const t = this.data_path.split('.');

        let n: any = {};
        let current = n;
        let last_key = t[t.length - 1];
        for (const key of t) {
            if (key === last_key) {
                current[key] = q
                break;
            }
            current[key] = {};
            current = current[key];
        }

        const resp = await query(this.axios, n);

        let data = resp;
        for (const key of t) {
            data = data[key];
        }

        return collect(data.data);

    }

    async processData(): Promise<CollectionClass<Item>> {
        let c = null;

        for (const step of this.steps) {
            if (methodSteps.includes(step.type)) {
                if (!c) c = await this.fetchData();
                c = c[step.type](...step.args);
                continue;
            }

            if (step.type === "forPage") {
                if (c) {
                    c = c.forPage(step.args[0], step.args[1]);
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData();
                    c = c.forPage(step.args[0], step.args[1]);
                } else {
                    this.offset = (step.args[0] - 1) * step.args[1];
                    this.limit = step.args[1];
                }
                this.already_limit = true;
                this.already_offset = true;
            }

            if (step.type === 'where') {
                if (c) {
                    c = c.where(step.field, step.operator as Operator, step.value)
                } else {
                    if (step.operator === '==') {
                        this.filters[step.field] = step.value
                    }
                }
            }

            if (step.type === 'whereIn') {
                if (!c) {
                    this.filters[step.args[0]] = { in: step.args[1] }
                }
                else {
                    c = c.whereIn(...step.args)
                }
            }

            if (step.type === 'whereNotBetween') {
                if (!c) {
                    this.filters[step.args[0]] = { notBetween: step.args[1] }
                }
                else {
                    c = c.whereNotBetween(...step.args)
                }
            }

            if (step.type === 'whereNotIn') {
                if (!c) {
                    this.filters[step.args[0]] = { notIn: step.args[1] }
                }
                else {
                    c = c.whereNotIn(...step.args)
                }
            }

            if (step.type == "whereBetween") {
                if (!c) {
                    this.filters[step.args[0]] = { between: step.args[1] }
                }
                else {
                    c = c.whereBetween(...step.args)
                }
            }


            if (step.type === 'sortByDesc') {
                if (c) {
                    c = c.sortByDesc(step.args[0])
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData();
                    c = c.sortByDesc(step.args[0])
                } else {
                    this._sort = step.args[0];
                    this._sortDesc = true;
                }
            }

            if (step.type === 'sortBy') {
                if (c) {
                    c = c.sortBy(step.args[0])
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData();
                    c = c.sortBy(step.args[0])
                } else {
                    this._sort = step.args[0];
                }
            }

            if (step.type === 'skip') {
                if (c) {
                    c = c.skip(step.args[0])
                } else if (this.already_offset || this.already_limit) {
                    c = await this.fetchData();
                    c = c.skip(step.args[0])
                } else {
                    this.offset = step.args[0];
                }
                this.already_offset = true;
            }


            if (step.type === 'take') {
                if (c) {
                    c = c.take(...step.args)
                } else if (this.already_offset || this.already_limit) {
                    c = await this.fetchData();
                    c = c.take(step.args[0])
                } else {
                    this.limit = step.args[0];
                }
                this.already_limit = true;
            }

            if (step.type === 'splice') {
                if (c) {
                    c = c.splice(...step.args)
                } else {
                    this.offset = step.args[0];
                    this.limit = step.args[1];
                }
                this.already_limit = true;
                this.already_offset = true;
            }

        }

        if (!c) {
            c = await this.fetchData();
        }
        return c;
    }

    async all() {
        return (await this.processData()).all();
    }
}

for (const key of [...methodSteps, ...methodStepsSQL]) {
    Collection.prototype[key] = function (...args: any[]) {
        const clone = this.clone();
        clone.steps.push({ type: key, args });
        return clone;
    }
}

for (const key of methodFinal) {
    Collection.prototype[key] = async function (...args: any[]) {
        const clone = this.clone();
        return (await clone.processData())[key](...args);
    }
}



export default Collection;