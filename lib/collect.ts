import collect from 'collect.js';
import { AxiosInstance } from 'axios';
import query from './query';
class Collection {


    private filters: any;
    private name: string;
    private axios: AxiosInstance;
    public limit: number | undefined;
    private _sort: string | undefined;
    private offset: number | undefined;

    private steps: Array<any>;
    private already_limit: boolean = false;
    private already_offset: boolean = false;

    constructor(name: string, axios: AxiosInstance) {
        this.name = name;
        this.axios = axios;
        this.filters = {};
        this.steps = [];
    }

    splice(index: number, number: number) {
        //clone self
        const clone = Object.create(this);
        this.steps.push({ type: 'splice', index, number });
        return clone;
    }

    take(count: number) {
        //clone self
        const clone = Object.create(this);
        this.steps.push({ type: 'take', count });
        return clone;
    }

    sortBy(field: string) {
        //clone self
        const clone = Object.create(this);
        this.steps.push({ type: 'sortBy', field });
        return clone;
    }

    pluck(field: string) {
        //clone self
        const clone = Object.create(this);
        this.steps.push({ type: 'pluck', field });
        return clone;
    }

    /*   random(length?: number) {
          //clone self
          const clone = Object.create(this);
          this.post_step.push({ type: 'random', length });
          return clone;
      } */

    where(field: string, operator: any, value: any) {
        if (arguments.length === 2) {
            value = operator;
            operator = '=';
        }

        this.steps.push({ type: 'where', field, operator, value });

        return this;
    }

    async fetchData(fields: Object) {
        let q: any = {};
        q.data = fields;

        let args: any = {};

        if (Object.keys(this.filters).length > 0) {
            args.filters = this.filters;
        }
        if (this._sort) {
            args.sort = this._sort;
        }

        if (this.limit) {
            q.data.__args = q.data.__args || {};
            q.data.__args.limit = this.limit;
        }

        if (this.offset) {
            q.data.__args = q.data.__args || {};
            q.data.__args.offset = this.offset;
        }


        q.__args = args;



        const data = await query(this.axios, {
            ['list' + this.name]: q
        })

        return collect(data['list' + this.name]['data']);

    }



    async all(fields: Object) {

        let c = null;
        for (const step of this.steps) {
            if (step.type === 'where') {
                if (c) {
                    c = c.where(step.field, step.operator, step.value)
                } else {
                    if (step.operator === '=') {
                        this.filters[step.field] = step.value
                    }

                }
            }

            if (step.type === 'pluck') {
                if (c) {
                    c = c.pluck(step.field)
                } else {
                    c = await this.fetchData(fields);
                    c = c.pluck(step.field)
                }
            }

            if (step.type === 'sortBy') {
                if (c) {
                    c = c.sortBy(step.field)
                } else if (this.already_limit || this.already_offset) {
                    c = await this.fetchData(fields);
                    c = c.sortBy(step.field)
                } else {
                    this._sort = step.field;
                }
            }


            if (step.type === 'take') {
                if (c) {
                    c = c.take(step.count)
                } else if (this.already_offset || this.already_limit) {
                    c = await this.fetchData(fields);
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
        }

        if (!c) {
            c = await this.fetchData(fields);
        }

        return c.all();

    }
}

export default (axios: AxiosInstance, name: string): any => {

    return new Collection(name, axios);
}
