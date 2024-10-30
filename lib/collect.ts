import collect from 'collect.js';
import { AxiosInstance } from 'axios';
import query from './query';
export class Collection {


    private filters: any;
    private data_path: string;
    private axios: AxiosInstance;
    public limit: number | undefined;
    private _sort: string | undefined;
    private _sortDesc: boolean = false;
    private offset: number | undefined;

    private steps: Array<any>;
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



    dataPath(path: string) {
        //clone
        const clone = this.clone();
        clone.data_path = path;
        return clone;
    }


    clone(): Collection {
        const clone = Object.create(this);
        clone.steps = [...this.steps];
        return clone;
    }

    chunk(size: number) {
        const clone = this.clone();
        clone.steps.push({ type: 'chunk', size });
        return clone;
    }

    shuffle() {
        const c = this.clone();
        c.steps.push({ type: 'shuffle' });
        return c;
    }

    forPage(page: number, chunk: number) {
        //deep clone self
        const clone = this.clone();
        clone.steps.push({ type: 'forPage', page, chunk });
        return clone
    }

    splice(index: number, number: number) {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'splice', index, number });
        return clone;
    }

    take(count: number) {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'take', count });
        return clone;
    }


    sortByDesc(field: string) {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'sortBy', field, desc: true });
        return clone;
    }

    async count() {
        let data = await this.all();
        return data.length;

    }

    sortBy(field: string) {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'sortBy', field });
        return clone;
    }

    pluck(field: string) {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'pluck', field });
        return clone;
    }

    /*   random(length?: number) {
          //clone self
          const clone = this.clone();
          this.post_step.push({ type: 'random', length });
          return clone;
      } */

    async first() {
        let data = await this.take(1).all();
        if (data.length > 0) {
            return data[0];
        }
        return null;
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

    map<T>(fn: (item: any, index: any) => T): Collection {
        //clone self
        const clone = this.clone();
        this.steps.push({ type: 'map', fn });
        return clone;
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

    reverse(): Collection {
        //clone self
        const clone = this.clone();
        clone.steps.push({ type: 'reverse' });
        return clone;
    }


    async all() {

        let c = null;
        for (const step of this.steps) {

            if (step.type === "chunk") {
                if (!c) c = await this.fetchData();
                c = c.chunk(step.size);
            }

            if (step.type === "reverse") {
                if (!c) c = await this.fetchData();
                c = c.reverse();
            }

            if (step.type === "shuffle") {
                if (!c) c = await this.fetchData();
                c = c.shuffle();
            }

            if (step.type === "forPage") {
                if (c) {
                    c = c.forPage(step.page, step.chunk);
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData();
                    c = c.forPage(step.page, step.chunk);
                } else {
                    this.offset = (step.page - 1) * step.chunk;
                    this.limit = step.chunk;
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

            if (step.type === 'pluck') {
                if (c) {
                    c = c.pluck(step.field)
                } else {
                    c = await this.fetchData();
                    c = c.pluck(step.field)
                }
            }

            if (step.type === 'sortBy') {
                if (c) {
                    c = c.sortBy(step.field)
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData();
                    c = c.sortBy(step.field)
                } else {
                    this._sort = step.field;
                    this._sortDesc = step.desc;
                }
            }


            if (step.type === 'take') {
                if (c) {
                    c = c.take(step.count)
                } else if (this.already_offset || this.already_limit) {
                    c = await this.fetchData();
                    c = c.take(step.count)
                } else {
                    this.limit = step.count;
                }
                this.already_limit = true;
            }

            if (step.type === 'splice') {
                if (c) {
                    c = c.splice(step.index, step.number)
                } else {
                    this.offset = step.index;
                    this.limit = step.number;
                }
                this.already_limit = true;
                this.already_offset = true;
            }

            if (step.type === 'map') {
                if (c) {
                    c = c.map(step.fn)
                } else {
                    c = await this.fetchData();
                    c = c.map(step.fn)
                }
            }
        }

        if (!c) {
            c = await this.fetchData();
        }

        return c.all();

    }
}
