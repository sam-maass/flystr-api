import { schemaComposer } from 'graphql-compose';
import { DealTC } from '../model/dealModel';

schemaComposer.Query.addFields({
  dealById: DealTC.getResolver('findById'),
  dealByIds: DealTC.getResolver('findByIds'),
  dealOne: DealTC.getResolver('findOne'),
  dealMany: DealTC.getResolver('findMany'),
  dealCount: DealTC.getResolver('count'),
  dealConnection: DealTC.getResolver('connection'),
  dealPagination: DealTC.getResolver('pagination')
});

// schemaComposer.Mutation.addFields({
//   //   dealCreateOne: DealTC.getResolver('createOne'),
//   //   dealCreateMany: DealTC.getResolver('createMany'),
//   //   dealUpdateById: DealTC.getResolver('updateById'),
//   //   dealUpdateOne: DealTC.getResolver('updateOne'),
//   //   dealUpdateMany: DealTC.getResolver('updateMany'),
//   //   dealRemoveById: DealTC.getResolver('removeById'),
//   //   dealRemoveOne: DealTC.getResolver('removeOne'),
//   //   dealRemoveMany: DealTC.getResolver('removeMany')
// });

export const graphqlSchema = schemaComposer.buildSchema();
