import collect from 'collect.js';
import { Collection as CollectionClass } from 'collect.js';
import { AxiosInstance } from 'axios';
import query from './query';

const methodSteps: string[] = ["chunk", "shuffle", "splice", "sortBy", "map", "reverse", "groupBy", "implode", "keyBy", "keys",
    "mapToDictionary", "mapWithKeys", "nth", "skipUntil", "skipWhile", "takeUntil", "takeWhile", "unique"]

const methodStepsSQL: string[] = ["forPage", "sortByDesc", "sortBy", "skip", "take", "splice", "whereBetween", "whereIn", "whereNotBetween", "whereNotIn", "first"]

//direct get result methods
const methodFinal: string[] = ["avg", "count", "countBy", "dd", "each", "every", "filter", "firstWhere", "isEmpty", "isNotEmpty",
    "last", "mapToGroups", "max", "median", "min", "mode", "contains", "sole", "sort", "split", "sum", "toJson"]


interface Collection<Item> {

    constructor(data_path: string, fields: Object, axios: AxiosInstance): void;

    [key: string]: any;
    /**
      * The all method returns the underlying array represented by the collection.
      */
    all(): Promise<Item[]>;

    /**
     * Alias for the avg() method.
     */
    average<K>(key?: keyof Item | K): Promise<number>;

    /**
     * The avg method returns the average of all items in the collection.
     */
    avg<K>(key?: keyof Item | K): Promise<number>;

    /**
     * The chunk method breaks the collection into multiple, smaller collections of a given size.
     */
    chunk(size: number): Collection<Item[]>;

    /**
     * The collapse method collapses a collection of arrays into a single, flat collection.
     */
    collapse(): Collection<Item>;

    /**
     * The combine method combines the keys of the collection with the values of another array or collection.
     */
    combine<T, U>(array: U[]): Collection<T>;

    /**
     * The concat method is used to merge two or more collections/arrays/objects.
     */
    concat<T>(collectionOrArrayOrObject: Collection<T> | T[] | object): any;

    /**
     * The contains method determines whether the collection contains a given item.
     */
    contains<K, V>(key: keyof Item | K | Function, value?: V): Promise<boolean>;

    /**
     * The count method returns the total number of items in the collection.
     */
    count(): Promise<number>;

    /**
     * The crossJoin method cross joins the collection with the given array or collection, returning all possible permutations.
     */
    crossJoin<T>(values: T[]): Collection<[Item, T]>;

    /**
     * The dd method will console.log the collection and exit the current process.
     */
    dd(): void;

    /**
     * The diff method compares the collection against another collection or a plain array based on its values.
     * This method will return the values in the original collection that are not present in the given collection.
     */
    diff<T>(values: T[] | Collection<Item>): Collection<Item>;

    /**
     * The diffAssoc method compares the collection against another collection or a plain object based on its keys
     * and values. This method will return the key / value pairs in the original collection that are not present in
     * the given collection:
     */
    diffAssoc<T>(values: T[] | Collection<T>): Collection<Item>;

    /**
     * The diffKeys method compares the collection against another collection or a plain object based on its keys.
     * This method will return the key / value pairs in the original collection that are not present in the given collection.
     */
    diffKeys<K extends keyof Item>(object: object): Collection<K>;

    /**
     * The dump method outputs the results at that moment and then continues processing.
     */
    dump(): this;

    /**
     * The each method iterates over the items in the collection and passes each item to a callback.
     */
    each(fn: (currentItem: Item, key?: string | number, collection?: Item[]) => void): this;

    /**
     * The every method may be used to verify that all elements of a collection pass a given truth test.
     */
    every(fn: (item: Item) => boolean): Promise<boolean>;

    /**
     * The except method returns all items in the collection except for those with the specified keys.
     */
    except<K>(properties: K[]): Collection<Item>;

    /**
     * The filter method filters the collection using the given callback,
     * keeping only those items that pass a given truth test.
     */
    filter(fn: (item: Item) => boolean): Collection<Item>;
    filter(fn: (item: Item, key?: any) => boolean): Collection<Item>;

    /**
     * The first method returns the first element in the collection that passes a given truth test.
     */
    first<V>(fn?: (item: Item, key: any) => boolean, defaultValue?: ((...any: any[]) => V | Item) | V | Item): Promise<Item>;

    /**
     * The flatMap method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items.
     * Then, the array is flattened by a level.
     */
    flatMap<T>(fn: (item: Item, key: any) => T): Collection<T>;

    /**
     * The flatten method flattens a multi-dimensional collection into a single dimension.
     */
    flatten(depth?: number): Collection<Item>;

    /**
     * The flip method swaps the collection's keys with their corresponding values.
     */
    flip(): Collection<Item>;

    /**
     * The forget method removes an item from the collection by its key.
     */
    forget<K>(key: keyof Item | K): this;

    /**
     * The forPage method returns a new collection containing the items that would be present on a given page number.
     * The method accepts the page number as its first argument
     * and the number of items to show per page as its second argument.
     */
    forPage(page: number, chunk: number): Collection<Item>;

    /**
     * The get method returns the item at a given key. If the key does not exist, null is returned.
     */
    get<K, V>(key: keyof Item | K, defaultValue?: ((...any: any[]) => V | Item) | V | Item): Item | null;

    /**
     * The groupBy method groups the collection's items by a given key.
     *
     */
    groupBy<T, K>(key: ((item: Item, index?: number) => K) | keyof Item | K): Collection<T>;

    /**
     * The has method determines if one or more keys exists in the collection.
     */
    has<K>(key: keyof Item | K | (keyof Item)[]): Promise<boolean>;

    /**
     * The implode method joins the items in a collection.
     * Its arguments depend on the type of items in the collection.
     *
     * If the collection contains arrays or objects,
     * you should pass the key of the attributes you wish to join,
     * and the "glue" string you wish to place between the values.
     */
    implode<K>(key: keyof Item | K, glue?: string): Promise<string>;

    /**
     * The intersect method removes any values from the original collection
     * that are not present in the given array or collection.
     * The resulting collection will preserve the original collection's keys.
     */
    intersect(values: Item[] | Collection<Item>): Collection<Item>;

    /**
     * The intersectByKeys method removes any keys from the original collection
     * that are not present in the given array or collection.
     */
    intersectByKeys<K extends keyof Item>(values: Item | Collection<Item>): Collection<K>

    /**
     * The isEmpty method returns true if the collection is empty; otherwise, false is returned.
     */
    isEmpty(): Promise<boolean>;

    /**
     * The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned.
     */
    isNotEmpty(): Promise<boolean>;

    /**
     * The keyBy method keys the collection by the given key.
     * If multiple items have the same key, only the last one will appear in the new collection.
     */
    keyBy<T, K>(key: keyof Item | K | Function): Collection<T>;

    /**
     * The keys method returns all of the collection's keys.
     */
    keys(): Collection<string>;

    /**
     * The last method returns the last element in the collection that passes a given truth test.
     */
    last(fn?: (item: Item) => boolean): Promise<Item>;

    /**
     * The macro method lets you register custom methods.
     */
    macro(name: string, fn: Function): void;

    /**
     * The map method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items.
     */
    map<T>(fn: (item: Item, index: any) => T): Collection<T>;

    /**
     * The mapInto method iterates through the collection and instantiates the given class with each element as a constructor.
     */
    mapInto<T extends Function>(ClassName: T): Collection<T>;

    /**
     * The mapToGroups method iterates through the collection and passes each value to the given callback.
     */
    mapToGroups(fn: Function): Collection<any>;

    /**
     * The mapWithKeys method iterates through the collection and passes each value to the given callback.
     * The callback should return an array where the first element represents the key
     * and the second element represents the value pair.
     */
    mapWithKeys<T>(fn: Function): Collection<T>;

    /**
     * The max method returns the maximum value of a given key.
     */
    max(key?: keyof Item | string): Promise<number>;

    /**
     * The median method returns the median value of a given key.
     */
    median<K>(key?: keyof Item | K): Promise<Item>;

    /**
     * The merge method merges the given object into the original collection.
     * If a key in the given object matches a key in the original collection,
     * the given objects value will overwrite the value in the original collection.
     */
    merge<T>(objectOrArray: object | T[]): Collection<T>;

    /**
     * The min method returns the minimum value of a given key.
     */
    min<K>(key?: keyof Item | K): Promise<number>;

    /**
     * The mode method returns the mode value of a given key.
     */
    mode<K>(key?: keyof Item | K): Collection<Item> | null;

    /**
     * The nth method creates a new collection consisting of every n-th element.
     */
    nth(n: number, offset?: number): Collection<Item>;

    /**
     * The only method returns the items in the collection with the specified keys.
     */
    only<K>(properties: K[]): Collection<Item>;

    /**
     * The partition method may be combined with destructuring to separate elements
     * that pass a given truth test from those that do not.
     */
    partition(fn: (item: Item) => boolean): Promise<[Item[], Item[]]>;

    /**
     * The pipe method passes the collection to the given callback and returns the result.
     */
    pipe<U>(fn: (...any: any[]) => U): U;

    /**
     * The pluck method retrieves all of the values for a given key.
     */
    pluck<T, K, V>(value: keyof Item | V, key?: keyof Item | K): Collection<T>;

    /**
     * The pop method removes and returns the last item from the collection.
     */
    pop(): Promise<Item>;

    /**
     * The prepend method adds an item to the beginning of the collection.
     */
    prepend<K, V>(value: V, key?: K): this;

    /**
     * The pull method removes and returns an item from the collection by its key.
     */
    pull<K>(key: keyof Item | K): Promise<Item | null>;

    /**
     * The push method appends an item to the end of the collection.
     */
    push(item: Item): this;

    /**
     * The put method sets the given key and value in the collection.
     */
    put<K, V>(key: K, value: V): this;

    /**
     * The random method returns a random item from the collection.
     */
    random(length?: number): this | Promise<Item>;

    /**
     * The reduce method reduces the collection to a single value,
     * passing the result of each iteration into the subsequent iteration.
     */
    reduce<T>(fn: (_carry: T | null, item: Item) => T, carry?: T): any;

    /**
     * The reject method filters the collection using the given callback.
     * The callback should return true if the item should be removed from the resulting collection.
     */
    reject(fn: (item: Item) => boolean): Collection<Item>;

    /**
     * The reverse method reverses the order of the collection's items.
     */
    reverse(): Collection<Item>;

    /**
     * The search method searches the collection for the given value and returns its key if found.
     * If the item is not found, false is returned.
     */
    search(valueOrFunction: Item | ((value: Item, key: number) => boolean), strict?: boolean): any;

    /**
     * The shift method removes and returns the first item from the collection.
     */
    shift(): Promise<Item>;

    /**
     * The shuffle method randomly shuffles the items in the collection.
     */
    shuffle(): this;

    /**
     * The slice method returns a slice of the collection starting at the given index.
     */
    slice(remove: number, limit?: number): Collection<Item>;

    /**
     * The sort method sorts the collection.
     */
    sort(fn?: (a: Item, b: Item) => number): Collection<Item>;

    /**
     * The sortBy method sorts the collection by the given key.
     * The sorted collection keeps the original array keys.
     */
    sortBy<V>(value: V): Collection<Item>;

    /**
     * The sortBy method sorts the collection by the given callback.
     * The sorted collection keeps the original array keys.
     */
    sortBy(fn: (item: Item) => number): Collection<Item>;

    /**
     * This method has the same signature as the sortBy method,
     * but will sort the collection in the opposite order.
     */
    sortByDesc<V>(value: V): Collection<Item>;

    /**
     * This method has the same signature as the sortBy method,
     * but will sort the collection in the opposite order.
     */
    sortByDesc(fn: (item: Item) => number): Collection<Item>;

    /**
     * The splice method removes and returns a slice of items starting at the specified index.
     * You may pass a second argument to limit the size of the resulting chunk.
     */
    splice(index: number, limit: number, replace?: Item[]): Collection<Item>;

    /**
     * The split method breaks a collection into the given number of groups.
     */
    split(numberOfGroups: number): Promise<Item[]>;

    /**
     * The sum method returns the sum of all items in the collection.
     */
    sum<K>(key?: keyof Item | K | ((item: Item) => number | string)): number | string;

    [Symbol.iterator]: () => Iterator<Item>;

    /**
     * The take method returns a new collection with the specified number of items:
     * You may also pass a negative integer to take the specified amount of items from the end of the collection.
     */
    take(length: number): Collection<Item>;

    /**
     * The tap method passes the collection to the given callback,
     * allowing you to "tap" into the collection at a specific point
     * and do something with the items while not affecting the collection itself.
     */
    tap(fn: (collection: Collection<Item>) => void): this;

    /**
     * The times method creates a new collection by invoking the callback a given amount of times.
     */
    times<T>(times: number, fn: (time: number) => T): T[];

    /**
     * The toArray method converts the collection into a plain array.
     * If the collection is an object, an array containing the values will be returned.
     */
    toArray<T>(): T[];

    /**
     * The toJson method converts the collection into JSON string.
     */
    toJson(): Promise<string>;

    /**
     * The transform method iterates over the collection and calls the given callback with each item in the collection.
     * The items in the collection will be replaced by the values returned by the callback.
     */
    transform<T>(fn: (item: Item) => T): Collection<T>;

    /**
     * The union method adds the given array to the collection.
     * If the given array contains keys that are already in the original collection,
     * the original collection's values will be preferred.
     */
    union<T>(object: Object): Collection<T>;

    /**
     * The unique method returns all of the unique items in the collection.
     */
    unique<K>(key?: keyof Item | K | Function): Collection<Item>;

    /**
     * The unless method will execute the given callback when the first argument given to the method evaluates to false.
     */
    unless(value: boolean, fn: (this: any) => any, defaultFn: (this: any) => any): void;

    /**
     * The unwrap method will unwrap the given collection.
     */
    unwrap<T>(value: T[] | Collection<T>): Promise<T[]>;

    /**
     * The values method returns a new collection with the keys reset to consecutive integers.
     */
    values<T>(): Collection<T>;

    /**
     * The when method will execute the given callback when the first argument given to the method evaluates to true.
     */
    when(condition: boolean, fn: (this: any) => any, defaultFn: (this: any) => any): void;

    /**
     * The where method filters the collection by a given key / value pair.
     */
    where<K, V>(key: keyof Item | K, value: V): Collection<Item>;

    /**
     * The where method filters the collection by a given key / value pair.
     */
    where<K, V>(key: keyof Item | K, operator: Operator, value: V): Collection<Item>;

    /**
     * The whereIn method filters the collection by a given key / value contained within the given array.
     */
    whereIn<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;

    /**
     * The whereNotIn method filters the collection by a given key / value not contained within the given array.
     */
    whereNotIn<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;

    /**
     * The wrap method will wrap the given value in a collection.
     */
    wrap<T>(value: T | T[] | Collection<T>): Collection<T>;

    /**
     * The zip method merges together the values of the given array with the values
     * of the original collection at the corresponding index.
     */
    zip<T>(array: T[]): Collection<[Item, T]>;
}

type Item = Object;

/* const Collection = function (this: Collection<Item>, data_path: string, fields: Object, axios: AxiosInstance) {
    this.data_path = data_path;
    this.axios = axios;
    this.filters = {};
    this.steps = [];
    this.fields = fields;
} */

class Collection<Item> {
    data_path: string;
    axios: AxiosInstance;
    filters: any;
    steps: any[];
    fields: Object;
    already_limit: boolean = false;
    already_offset: boolean = false
    limit: null | number = null;
    offset: null | number = null;
    _sort: string | null = null;
    _sortDesc: boolean = false;

    constructor(data_path: string, fields: Object, axios: AxiosInstance) {
        this.data_path = data_path;
        this.axios = axios;
        this.filters = {};
        this.steps = [];
        this.fields = fields;
    }
}


Collection.prototype.dataPath = function (path: string) {
    //clone
    const clone = this.clone();
    clone.data_path = path;
    return clone;
}

Collection.prototype.buildArgs = function () {
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

Collection.prototype.clone = function (): Collection<Item> {
    const clone = Object.create(this);
    clone.steps = [...this.steps];
    return clone;
}

Collection.prototype.fetchData = async function () {
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


Collection.prototype.processData = async function (): Promise<CollectionClass<Item>> {

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

Collection.prototype.all = async function () {
    return (await this.processData()).all();
}

for (const key of [...methodSteps, ...methodStepsSQL]) {
    Collection.prototype[key] = function (...args: any[]) {
        const new_obj = this.clone();
        new_obj.steps.push({ type: key, args });
        return new_obj;
    }
}

for (const key of methodFinal) {
    Collection.prototype[key] = async function (...args: any[]) {
        const clone = this.clone();
        return (await clone.processData())[key](...args);
    }
}


Collection.prototype.average = Collection.prototype.avg;
Collection.prototype.first = async function () {
    this.take(1);
    return (await this.processData()).first();

}


export default Collection;