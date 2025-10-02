import { defu } from 'defu';
import { AxiosInstance } from 'axios';
import query from './query';

type Fields = Record<string, any>;

export default function createList(axios: AxiosInstance, entity: string, fields: Fields) {
	let dataArgs: Record<string, any> | undefined = undefined;
	// unified filters: exact-match args are stored as the first element (object),
	// operator-based filters are pushed as subsequent elements (objects)
	let filters: Array<Record<string, any>> = [];

	let sort: string | undefined = undefined;
	let dataPathStr: string | undefined = undefined;

	// helper to detect if an object looks like an operator filter (has keys like _gt, _in...)
	const isOperatorObj = (obj: Record<string, any> | undefined) => {
		if (!obj || typeof obj !== 'object') return false;
		return Object.values(obj).some(v => v && typeof v === 'object' && Object.keys(v).some(k => k.startsWith('_')));
	};

	// ensure there is an args object at filters[0] to merge exact-match key/values
	const ensureArgsObject = () => {
		if (filters.length === 0) {
			filters.unshift({});
			return filters[0];
		}
		if (isOperatorObj(filters[0])) {
			// don't merge into an operator object; create a dedicated args object at index 0
			filters.unshift({});
		}
		return filters[0];
	};

	return {

		async fetchWithMeta() {
			// perform the query with meta and return both data and meta
			const resp = await query(axios, this.toQuery(true));
			// Navigate through dataPath if specified
			let result = resp;
			if (dataPathStr) {
				const pathParts = dataPathStr.split('.');
				for (const part of pathParts) {
					result = result[part];
				}
				return result;
			}
			return result[`list${entity}`];
		},
		async fetch() {

			// perform the query and return the data array
			const resp = await query(axios, this.toQuery());
			// Navigate through dataPath if specified
			let result = resp;
			if (dataPathStr) {
				const pathParts = dataPathStr.split('.');
				for (const part of pathParts) {
					result = result[part];
				}
				return result.data;
			}
			return result[`list${entity}`].data;
		}, dataPath(dataPath?: string) {
			if (dataPath && typeof dataPath === 'string') {
				dataPathStr = dataPath;
			}
			return this;
		},

		sort(sortStr: string) {
			if (sortStr && typeof sortStr === 'string') {
				sort = sortStr;
			}
			return this;
		},

		filters(filterObj: Record<string, any>) {
			if (filterObj && typeof filterObj === 'object') {
				filters = [filterObj];
			}
			return this;
		},


		// where can be called as:
		// where('key', value)  -> exact match
		// where('key', '>', value) -> operator-based (>, <, >=, <=, !=, in, contains)
		where(key: string, opOrVal?: any, maybeVal?: any) {
			// helper to push operator-based filter
			const pushOperator = (field: string, operator: string, val: any) => {
				const map: Record<string, string> = {
					'>': '_gt',
					'<': '_lt',
					'>=': '_gte',
					'<=': '_lte',
					'!=': '_ne',
					'in': '_in',
					'contains': '_contains',
				};
				const opKey = map[operator];
				if (opKey) {
					filters.push({ [field]: { [opKey]: val } });
				}
			};

			// called as where(field, operator, value) OR where(field, value)
			if (maybeVal !== undefined) {
				// where(field, operator, value)
				pushOperator(key, String(opOrVal), maybeVal);
			} else {
				// where(field, value) -> exact match: merge into args object at filters[0]
				const argsObj = ensureArgsObject();
				const merged = defu(argsObj, { [key]: opOrVal });
				filters[0] = merged;
			}

			return this;
		},

		// whereContains adds a _contains filter for a specific field
		// If the same field is used multiple times, it merges them into an array
		whereContains(field: string, val: any) {
			if (field && typeof field === 'string') {
				const argsObj = ensureArgsObject();
				const newCondition = { _contains: val };

				// Check if this field already exists in argsObj
				if (argsObj[field]) {
					// If it's already an array, push to it
					if (Array.isArray(argsObj[field])) {
						argsObj[field].push(newCondition);
					} else {
						// Convert existing single condition to array
						argsObj[field] = [argsObj[field], newCondition];
					}
				} else {
					// First time using this field, set it as array
					argsObj[field] = [newCondition];
				}
				filters[0] = argsObj;
			}
			return this;
		},

		// ...existing code...

		// whereIn adds an _in filter for a specific field
		// If the same field is used multiple times, it merges them into an array
		whereIn(field: string, vals: any[]) {
			if (field && typeof field === 'string' && Array.isArray(vals)) {
				const argsObj = ensureArgsObject();
				const newCondition = { _in: vals };

				// Check if this field already exists in argsObj
				if (argsObj[field]) {
					// If it's already an array, push to it
					if (Array.isArray(argsObj[field])) {
						argsObj[field].push(newCondition);
					} else {
						// Convert existing single condition to array
						argsObj[field] = [argsObj[field], newCondition];
					}
				} else {
					// First time using this field, set it as array
					argsObj[field] = [newCondition];
				}
				filters[0] = argsObj;
			}
			return this;
		},

		// whereBetween adds a _between filter for a specific field
		whereBetween(field: string, min: any, max: any) {
			if (field && typeof field === 'string') {
				const argsObj = ensureArgsObject();
				const newCondition = { _between: [min, max] };

				// Check if this field already exists in argsObj
				if (argsObj[field]) {
					// If it's already an array, push to it
					if (Array.isArray(argsObj[field])) {
						argsObj[field].push(newCondition);
					} else {
						// Convert existing single condition to array
						argsObj[field] = [argsObj[field], newCondition];
					}
				} else {
					// First time using this field, set it directly (not as array)
					argsObj[field] = newCondition;
				}
				filters[0] = argsObj;
			}
			return this;
		},

		// limit sets paging/limit for the data selection
		limit(n: number) {
			if (typeof n === 'number' && Number.isFinite(n)) {
				dataArgs = defu(dataArgs || {}, { limit: n });
			}
			return this;
		},

		// offset sets the starting index for the data selection
		offset(n: number) {
			if (typeof n === 'number' && Number.isFinite(n)) {
				dataArgs = defu(dataArgs || {}, { offset: n });
			}
			return this;
		},

		toQuery(includeMeta = false) {
			let filtersArg: any = undefined;
			const hasArgs = filters.length > 0 && Object.keys(filters[0] || {}).length > 0;
			const otherStart = hasArgs ? 1 : 0;
			const hasOtherFilters = filters.length > otherStart;
			if (hasArgs && hasOtherFilters) {
				// args object + other operator filters -> return array [args, ...others]
				filtersArg = filters;
			} else if (hasOtherFilters) {
				// only operator filters -> return array
				filtersArg = filters.slice(otherStart);
			} else if (hasArgs) {
				// only args -> return single object
				filtersArg = filters[0];
			}

			// Build top-level __args
			const topArgs = defu(
				sort ? { sort } : {},
				filtersArg ? { filters: filtersArg } : {}
			);

			// Build the core query structure
			const listQuery: any = {
				data: {
					...fields,
				}
			};

			// Only add __args to data if it exists
			if (dataArgs) {
				listQuery.data.__args = dataArgs;
			}

			// Only add __args to top level if it exists
			if (Object.keys(topArgs).length > 0) {
				listQuery.__args = topArgs;
			}

			// Add meta fields if includeMeta is true
			if (includeMeta) {
				listQuery.meta = {
					total: true,
					key: true,
					name: true
				};
			}

			// If dataPath is specified, use it as the full path
			if (dataPathStr) {
				const pathParts = dataPathStr.split('.');
				let result: any = listQuery;

				// Build nested structure from inside out
				for (let i = pathParts.length - 1; i >= 0; i--) {
					result = {
						[pathParts[i]]: result
					};
				}

				return result;
			}

			// Default: use list${entity} as key
			return {
				[`list${entity}`]: listQuery,
			};
		},
	};
}