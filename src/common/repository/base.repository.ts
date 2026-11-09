import mongoose, {
  DeleteResult,
  FlattenMaps,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  QueryWithHelpers,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import {
  AnyKeys,
  CreateOptions,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
} from "mongoose";
import { IPaginate } from "../interface/paginate.interface.js";

export abstract class DatabaseRepository<TRowDocument> {
  constructor(protected model: Model<TRowDocument>) {}
  // create
  async create({
    data,
  }: {
    data: AnyKeys<TRowDocument>;
  }): Promise<HydratedDocument<TRowDocument>>;
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRowDocument>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRowDocument>[]>;
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRowDocument> | AnyKeys<TRowDocument>[];
    options?: CreateOptions;
  }): Promise<
    HydratedDocument<TRowDocument> | HydratedDocument<TRowDocument>[]
  > {
    return await this.model.create(data as any, options);
  }
  async createOne({
    data,
    options = {},
  }: {
    data: AnyKeys<TRowDocument>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRowDocument>> {
    const [doc] = await this.create({ data: [data], options });
    return doc as HydratedDocument<TRowDocument>;
  }
  //   finder one

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?:
      | (QueryOptions<TRowDocument> & { lean?: false })
      | null
      | undefined;
  }): Promise<HydratedDocument<TRowDocument> | null | undefined>;

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?: (QueryOptions<TRowDocument> & { lean: true }) | null | undefined;
  }): Promise<
    | HydratedDocument<TRowDocument>
    | FlattenMaps<TRowDocument>
    | null
    | undefined
  >;

  async findOne({
    filter = {},
    projection,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?:
      | (QueryOptions<TRowDocument> & { lean?: boolean })
      | null
      | undefined;
  }): Promise<
    | HydratedDocument<TRowDocument>
    | FlattenMaps<TRowDocument>
    | null
    | undefined
  > {
    const doc = this.model.findOne(filter, projection);
    if (options?.populate) {
      doc?.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc?.lean(options.lean);
    }
    return await doc.exec();
  }

  // find by id
  async findById({
    id,
    projection,
    options,
  }: {
    id: mongoose.Types.ObjectId;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?:
      | (QueryOptions<TRowDocument> & { lean?: false })
      | null
      | undefined;
  }): Promise<HydratedDocument<TRowDocument> | null | undefined>;

  async findById({
    id,
    projection,
    options,
  }: {
    id: mongoose.Types.ObjectId;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?: (QueryOptions<TRowDocument> & { lean: true }) | null | undefined;
  }): Promise<
    | HydratedDocument<TRowDocument>
    | FlattenMaps<TRowDocument>
    | null
    | undefined
  >;

  async findById({
    id,
    projection,
    options,
  }: {
    id: mongoose.Types.ObjectId;
    projection?: ProjectionType<TRowDocument> | null | undefined;
    options?:
      | (QueryOptions<TRowDocument> & { lean?: boolean })
      | null
      | undefined;
  }): Promise<
    | HydratedDocument<TRowDocument>
    | FlattenMaps<TRowDocument>
    | null
    | undefined
  > {
    const doc = this.model.findById(id, projection);
    if (options?.populate) {
      doc?.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc?.lean(options.lean);
    }
    return await doc.exec();
  }

  // find
  async find({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<TRowDocument>;
    options?: QueryOptions<TRowDocument> | null | undefined;
    projection?: ProjectionType<TRowDocument> | null | undefined;
  }): Promise<HydratedDocument<TRowDocument>[]> {
    const doc = this.model.find(filter);
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.skip) {
      doc.skip(options.skip);
    }

    if (options?.limit) {
      doc.limit(options.limit);
    }

    if (options?.lean) {
      doc.lean(options.lean);
    }
    if (options?.sort) {
      doc.sort(options.sort);
    }
    return await doc.exec();
  }

  async countDocuments({
    filter = {},
  }: {
    filter?: QueryFilter<TRowDocument>;
  }): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async paginate({
    filter = {},
    options = {},
    page = 1,
    limit = 5,
  }: {
    filter: QueryFilter<TRowDocument>;
    options?: QueryOptions<TRowDocument> | null | undefined;
    page: number;
    limit: number;
  }): Promise<IPaginate<HydratedDocument<TRowDocument>>> {
    const skip = (page - 1) * limit;

    const count = await this.countDocuments({ filter });
    const pages = Math.ceil(count / limit);

    const docs = await this.find({
      filter,
      options: { skip, limit, ...options },
    });
    return {
      docs,
      pages,
      count,
      limit,
      currentPage: page,
    };
  }
  //   update
  async updateOne({
    filter = {},
    update,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRowDocument> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update, options);
  }

  async updateMany({
    filter = {},
    update,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRowDocument> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(filter, update, options);
  }

  async findOneUpdate({
    filter = {},
    update,
    options,
  }: {
    filter: QueryFilter<TRowDocument>;
    update: UpdateQuery<TRowDocument>;
    options?: QueryOptions<TRowDocument> | null;
  }): Promise<HydratedDocument<TRowDocument> | null> {
    return await this.model.findOneAndUpdate(filter, update, {
      returnDocument: "after",
      ...options,
    });
  }

  async findByIdUpdate({
    id,
    update,
    options,
  }: {
    id: mongoose.Types.ObjectId;
    update: UpdateQuery<TRowDocument>;
    options?: QueryOptions<TRowDocument> | null;
  }): Promise<HydratedDocument<TRowDocument> | null> {
    return await this.model.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      ...options,
    });
  }

  // delete

  async deleteOne({
    filter = {},
  }: {
    filter: QueryFilter<TRowDocument>;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }

  async deleteMany({
    filter = {},
  }: {
    filter: QueryFilter<TRowDocument>;
  }): Promise<DeleteResult> {
    return await this.model.deleteMany(filter);
  }

  async findOneDelete({
    filter = {},
  }: {
    filter: QueryFilter<TRowDocument>;
  }): Promise<HydratedDocument<TRowDocument> | null> {
    return await this.model.findOneAndDelete(filter);
  }

  async findByIdDelete({
    id,
  }: {
    id: mongoose.Types.ObjectId;
  }): Promise<HydratedDocument<TRowDocument> | null> {
    return await this.model.findByIdAndDelete(id);
  }
}
