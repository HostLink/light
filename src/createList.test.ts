import { describe, it, expect } from 'vitest';
import createList from './createList';

describe('createList', () => {
	it('should create a list instance', () => {
		const list = createList('Users', { id: true, name: true });
		expect(list).toBeDefined();
		expect(typeof list.fetch).toBe('function');
		expect(typeof list.toQuery).toBe('function');
	});

	it('should generate basic query', () => {
		const list = createList('Users', { id: true, name: true });
		const query = list.toQuery();

		expect(query).toEqual({
			listUsers: {
				data: {
					id: true,
					name: true,
				},
			},
		});
	});

	it('should apply limit and offset', () => {
		const list = createList('Users', { id: true })
			.limit(10)
			.offset(5);

		const query = list.toQuery();

		expect(query.listUsers.data.__args).toEqual({
			limit: 10,
			offset: 5,
		});
	});

	it('should apply sort', () => {
		const list = createList('Users', { id: true })
			.sort('name');

		const query = list.toQuery();

		expect(query.listUsers.__args).toEqual({
			sort: 'name',
		});
	});

	it('should apply where exact match filter', () => {
		const list = createList('Users', { id: true })
			.where('status', 'active');

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toEqual({
			status: 'active',
		});
	});

	it('should apply where operator filter', () => {
		const list = createList('Users', { id: true })
			.where('age', '>', 18);

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toEqual({
			age: { _gt: 18 },
		});
	});

	it('should apply whereIn filter', () => {
		const list = createList('Users', { id: true })
			.whereIn('status', ['active', 'pending']);

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toEqual({
			status: [{ _in: ['active', 'pending'] }],
		});
	});

	it('should apply whereContains filter', () => {
		const list = createList('Users', { id: true })
			.whereContains('name', 'John');

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toEqual({
			name: [{ _contains: 'John' }],
		});
	});

	it('should apply whereBetween filter', () => {
		const list = createList('Users', { id: true })
			.whereBetween('age', 18, 65);

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toEqual({
			age: { _between: [18, 65] },
		});
	});

	it('should chain multiple filters', () => {
		const list = createList('Users', { id: true, name: true })
			.where('status', 'active')
			.where('age', '>', 18)
			.sort('name')
			.limit(10);

		const query = list.toQuery();

		expect(query.listUsers.__args.filters).toBeDefined();
		expect(query.listUsers.__args.sort).toBe('name');
		expect(query.listUsers.data.__args.limit).toBe(10);
	});

	it('should include meta when requested', () => {
		const list = createList('Users', { id: true });
		const query = list.toQuery(true);

		expect(query.listUsers.meta).toEqual({
			total: true,
			key: true,
			name: true,
		});
	});

	it('should apply dataPath to query', () => {
		const list = createList('Users', { id: true })
			.dataPath('data.response.listUsers');

		const query = list.toQuery();

		expect(query).toEqual({
			data: {
				response: {
					listUsers: {
						data: {
							id: true,
						},
					},
				},
			},
		});
	});
});
