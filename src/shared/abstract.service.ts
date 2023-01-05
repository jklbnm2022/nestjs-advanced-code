import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  SaveOptions,
} from 'typeorm';

export abstract class AbstractService {
  constructor(protected readonly repository: Repository<any>) {}

  async save(entity: any, options?: SaveOptions) {
    return await this.repository.save(entity);
  }

  async find(options: FindManyOptions<any> = {}) {
    return await this.repository.find(options);
  }

  async findOne(options: FindOneOptions<any>) {
    return await this.repository.findOne(options);
  }

  async update(id: number, options) {
    return await this.repository.update(id, options);
  }
}
