import collect from 'collect.js';
import { Collection as CollectionClass } from 'collect.js';
import { AxiosInstance } from 'axios';
import query from './query';

// 定義操作符類型
type Operator = '==' | '<' | '<=' | '>' | '>=' | '!==';

// 定義過濾器類型
interface FilterValue {
    lt?: any;
    lte?: any;
    gt?: any;
    gte?: any;
    ne?: any;
    contains?: string;
    in?: any[];
    nin?: any[];
    between?: any[];
    notBetween?: any[];
}

interface Filters {
    [key: string]: any | FilterValue;
}

// 定義步驟類型
interface Step {
    type: string;
    args: any[];
}

// 定義 meta 資料類型
interface MetaData {
    total?: boolean;
    key?: boolean;
    name?: boolean;
    [key: string]: any;
}

// 常數定義
const COLLECTION_PREFIX = 'list';

const methodSteps: string[] = ["flatMap", "chunk", "shuffle", "splice", "sortBy", "map", "reverse", "groupBy", "keyBy", "keys",
    "mapToDictionary", "mapWithKeys", "nth", "skipUntil", "skipWhile", "takeUntil", "takeWhile", "unique", "pluck", "push", "only", "pad",
    "slice", "tap", "sort"]


//direct get result methods
const methodFinal: string[] = ["avg", "count", "countBy", "dd", "each", "every", "filter", "firstWhere", "isEmpty", "isNotEmpty",
    "last", "mapToGroups", "max", "median", "min", "mode", "contains", "sole", "sort", "split", "sum", "toJson", "get", "has", "implode", "partition"]


interface Collection<Item> {

    constructor(fields: Record<string, any>, axios: AxiosInstance): void;

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

class Collection<Item> {

    _batchData: any = null;
    data_path: string = '';
    axios: AxiosInstance;
    filters: Filters;
    steps: Step[];
    fields: Record<string, any>;
    already_limit: boolean = false;
    already_offset: boolean = false
    limit: null | number = null;
    offset: null | number = null;
    _sort: string | null = null;
    _sortDesc: boolean = false;
    meta: MetaData = {};

    constructor(fields: Record<string, any>, axios: AxiosInstance) {
        this.axios = axios;
        this.filters = {};
        this.steps = [];
        this.fields = fields;
    }
}

Collection.prototype.getQueryPayload = function () {
    // 組建查詢 payload，但不執行 fetchData
    let q: any = {
        meta: {
            total: true,
            key: true,
            name: true
        }
    };
    q.__args = this.buildArgs();
    q.data = this.fields;

    q.data.__args = q.data.__args || {};
    if (this.limit) {
        q.data.__args.limit = this.limit;
    }

    if (this.offset) {
        q.data.__args.offset = this.offset;
    }

    return {
        data_path: this.data_path,
        query: q,
        steps: this.steps,
    };
}


Collection.prototype.dataPath = function (path: string) {
    // 複製當前集合並設定新的資料路徑
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
    clone.steps = JSON.parse(JSON.stringify(this.steps));
    clone.filters = JSON.parse(JSON.stringify(this.filters));
    clone.fields = JSON.parse(JSON.stringify(this.fields));
    return clone;
}

collect().macro('whereContains', function (this: any, field: string, value: string) {
    return this.filter((item: any) => {
        //check value is in item[field] (case insensitive)
        return item[field].toLowerCase().includes(value.toLowerCase());
    });
});

Collection.prototype.fetchData = async function () {
    try {
        if (this._batchData) {
            // 如果有批次資料，直接使用
            const data = this._batchData;
            this.meta = data.meta;
            return collect(data.data);
        }
        
        let q: any = {
            meta: {
                total: true,
                key: true,
                name: true
            }
        };
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

        this.meta = data.meta;
        return collect(data.data);
    } catch (error) {
        console.error('Error fetching collection data:', error);
        throw error;
    }
}


Collection.prototype.processData = async function (): Promise<CollectionClass<Item>> {
    let c = await this.fetchData();
    for (const step of this.steps) {
        c = c[step.type](...step.args);
    }
    return c;
}

Collection.prototype.all = async function () {
    return (await this.processData()).all();
}

for (const key of methodSteps) {
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


// 新增通用的批次資料檢查方法
Collection.prototype._handleBatchData = function(methodType: string, args: any[]) {
    if (this._batchData) {
        this.steps.push({ type: methodType, args });
        return this;
    }
    return null;
};

Collection.prototype.where = function (...args: any[]) {
    const batchResult = this._handleBatchData('where', args);
    if (batchResult) return batchResult;

    if (args.length === 2) {
        this.filters[args[0]] = args[1];
    } else if (args.length === 3) {
        const field = args[0];
        const operator = args[1] as Operator;
        const value = args[2];

        switch (operator) {
            case '==':
                this.filters[field] = value;
                break;
            case '<':
                this.filters[field] = { lt: value };
                break;
            case '<=':
                this.filters[field] = { lte: value };
                break;
            case '>':
                this.filters[field] = { gt: value };
                break;
            case '>=':
                this.filters[field] = { gte: value };
                break;
            case '!==':
                this.filters[field] = { ne: value };
                break;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    return this;
}

Collection.prototype.whereContains = function (field: string, value: string) {
    const batchResult = this._handleBatchData('whereContains', [field, value]);
    if (batchResult) return batchResult;

    this.filters[field] = { contains: value };
    return this;
}

Collection.prototype.forPage = function (page: number, limit: number) {
    page = Math.max(1, page);
    if (this.already_limit) {
        this.steps.push({ type: 'forPage', args: [page, limit] });
        return this;
    }


    this.limit = limit;
    this.offset = (page - 1) * limit;
    this.already_limit = true;
    this.already_offset = true;
    return this;
}

Collection.prototype.whereIn = function (field: string, values: any[]) {
    const batchResult = this._handleBatchData('whereIn', [field, values]);
    if (batchResult) return batchResult;
    
    this.filters[field] = { in: values };
    return this;
}

Collection.prototype.whereNotIn = function (field: string, values: any[]) {
    const batchResult = this._handleBatchData('whereNotIn', [field, values]);
    if (batchResult) return batchResult;
    
    this.filters[field] = { nin: values };
    return this;
}

Collection.prototype.whereNotBetween = function (field: string, values: any[]) {
    const batchResult = this._handleBatchData('whereNotBetween', [field, values]);
    if (batchResult) return batchResult;
    
    this.filters[field] = { notBetween: values };
    return this;
}

Collection.prototype.whereBetween = function (field: string, values: any[]) {
    const batchResult = this._handleBatchData('whereBetween', [field, values]);
    if (batchResult) return batchResult;
    
    this.filters[field] = { between: values };
    return this;
}

Collection.prototype.sortBy = function <V>(valueOrFn: V | ((item: any) => number)) {
    this.steps.push({ type: 'sortBy', args: [valueOrFn] });
    if (typeof valueOrFn === 'string') {
        this._sort = valueOrFn as string;
    }
    return this;
}

Collection.prototype.sortByDesc = function <V>(valueOrFn: V | ((item: any) => number)) {
    this.steps.push({ type: 'sortByDesc', args: [valueOrFn] });
    if (typeof valueOrFn === 'string') {
        this._sort = valueOrFn as string;
        this._sortDesc = true;
    }
    return this;
}

Collection.prototype.skip = function (offset: number) {
    if (offset < 0) {
        throw new Error('Offset must be non-negative');
    }
    
    if (this.already_offset) {
        this.steps.push({ type: 'skip', args: [offset] });
    }
    this.offset = offset;
    this.already_offset = true;
    return this;
}

Collection.prototype.take = function (length: number) {
    if (length < 0) {
        throw new Error('Length must be non-negative');
    }
    
    if (this.already_limit) {
        this.steps.push({ type: 'take', args: [length] });
        return this;
    }

    this.limit = length;
    this.already_limit = true;
    return this;
}

Collection.prototype.splice = function (index: number, limit: number) {
    this.steps.push({ type: 'splice', args: [index, limit] });
    this.offset = index;
    this.limit = limit;
    this.already_limit = true;
    this.already_offset = true;
    return this;
}

export default (name: string, axios: AxiosInstance, fields: Record<string, any>): Collection<any> => {
    const c = new Collection(fields, axios);
    c.data_path = COLLECTION_PREFIX + name;
    return c;
}