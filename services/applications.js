import BaseService from './base.js';

class ApplicationsService extends BaseService {
  constructor() {
    super('applications');
  }

  // All CRUD operations are now inherited from BaseService:
  // - create(applicationData)
  // - getAll(options)
  // - getById(id)
  // - update(id, updateData)
  // - softDelete(id)
  // - restore(id)
  // - getDeleted(options)
  // - permanentDelete(id)

  // You can add application-specific methods here if needed
  // For example:
  // async getByTenantId(tenantId) { ... }
  // async getByStatus(status) { ... }
}

export default new ApplicationsService();
