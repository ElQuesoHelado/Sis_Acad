import { type Repository } from "typeorm";
import { SystemConfigModel } from "../models/system-config.model.js";
import { AppDataSource } from "../database.config.js";
import { type ISystemConfigRepository } from "@/domain/repositories/isystem-config.repository.js";

export class TypeormSystemConfigRepository implements ISystemConfigRepository {
  private ormRepo: Repository<SystemConfigModel>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(SystemConfigModel);
  }

  public async get(key: string): Promise<string | null> {
    const config = await this.ormRepo.findOneBy({ key });
    return config ? config.value : null;
  }

  public async set(key: string, value: string): Promise<void> {
    const config = await this.ormRepo.findOneBy({ key });
    if (config) {
      config.value = value;
      await this.ormRepo.save(config);
    } else {
      await this.ormRepo.save({ key, value });
    }
  }
}
