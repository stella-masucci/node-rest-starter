import { model, Model, Schema } from 'mongoose';
import should from 'should';

import {
	ContainsSearchable,
	containsSearchPlugin
} from './contains-search.plugin';

interface IExample {
	field: string;
}
type ExampleModel = Model<IExample, ContainsSearchable>;

const ContainsExampleSchema = new Schema<IExample, ExampleModel>({
	field: String
});
ContainsExampleSchema.plugin(containsSearchPlugin);

const ContainsExample = model<IExample, ExampleModel>(
	'ContainsExample',
	ContainsExampleSchema
);

const ContainsExample2Schema = new Schema<IExample, ExampleModel>({
	field: String
});
ContainsExample2Schema.plugin(containsSearchPlugin, {
	fields: ['field1', 'field2']
});

const ContainsExample2 = model<IExample, ExampleModel>(
	'ContainsExample2',
	ContainsExample2Schema
);

/**
 * Unit tests
 */
describe('Contains Search Plugin:', () => {
	describe('containsSearch:', () => {
		it('should add containsSearch function to query', () => {
			const query = ContainsExample.find();
			should.exist(query.containsSearch);

			query.containsSearch.should.be.Function();
		});

		it('should not add to filter if search term is null/undefined/empty string', () => {
			[null, undefined, ''].forEach((search) => {
				const query = ContainsExample.find().containsSearch(search);

				const filter = query.getFilter();
				should.exist(filter);
				should.not.exist(filter.$or);
			});
		});

		it('should not add to filter if field list is empty', () => {
			[null, []].forEach((fields) => {
				const query = ContainsExample.find().containsSearch('test', fields);

				const filter = query.getFilter();
				should.exist(filter);
				should.not.exist(filter.$or);
			});
		});

		it('should use provided fields list', () => {
			const query = ContainsExample.find().containsSearch('test', [
				'field1',
				'field2',
				'field3'
			]);

			const filter = query.getFilter();
			should.exist(filter);
			should.exist(filter.$or);
			filter.$or.should.be.an.Array();
			filter.$or.length.should.equal(3);
		});

		it('should not create $or if only one field in list', () => {
			const query = ContainsExample.find().containsSearch('test', ['field1']);

			const filter = query.getFilter();
			should.exist(filter);
			should.not.exist(filter.$or);
			should.exist(filter.field1);
		});

		it('should use default fields list in pluginOptions', () => {
			const query = ContainsExample2.find().containsSearch('test');

			const filter = query.getFilter();
			should.exist(filter);
			should.exist(filter.$or);
			filter.$or.should.be.Array();
			filter.$or.length.should.equal(2);
		});
	});
});
