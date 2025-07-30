// Mock axios for testing without real API
const mockAxios = jest.createMockFromModule('axios');

// Mock response data storage
const mockData = {
  tables: [],
  records: {}
};

// Pre-populate with some test data to ensure tests work
const testTableName = 'test_users';
mockData.tables.push({
  name: testTableName,
  columns: [
    { name: 'id', type: 'uuid', primaryKey: true },
    { name: 'email', type: 'varchar', unique: true, required: true },
    { name: 'name', type: 'varchar', required: true },
    { name: 'age', type: 'integer' }
  ],
  created_at: new Date().toISOString()
});
mockData.records[testTableName] = [
  { id: '1', email: 'test1@example.com', name: 'Test User 1', age: 25 },
  { id: '2', email: 'test2@example.com', name: 'Test User 2', age: 30 },
  { id: '3', email: 'test3@example.com', name: 'Test User 3', age: 35 }
];

// Helper to generate IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create a mock axios instance
mockAxios.create = jest.fn((config) => {
  // Store the default headers from config
  if (config && config.headers) {
    mockAxios.defaults = { headers: { common: config.headers } };
  }
  return mockAxios;
});

// Mock request interceptors
mockAxios.interceptors = {
  request: { use: jest.fn() },
  response: { use: jest.fn() }
};

// Main request mock
mockAxios.request = jest.fn((config) => {
  const { method, url, data } = config;
  
  const urlParts = url.split('/');
  
  // Merge default headers with request headers
  const headers = {
    ...(mockAxios.defaults?.headers?.common || {}),
    ...(config.headers || {})
  };
  
  // Check for invalid API key
  if (headers['x-api-key'] === 'invalid-key' || headers['X-API-Key'] === 'invalid-key') {
    return Promise.reject({
      response: {
        status: 401,
        data: { error: 'Invalid API key' }
      }
    });
  }
  
  // Mock health endpoint
  if (url.includes('/health')) {
    return Promise.resolve({
      data: { status: 'ok', timestamp: new Date().toISOString() },
      status: 200
    });
  }
  
  // Mock schema operations
  if (url.includes('/schema/tables')) {
    if (method === 'get') {
      // List tables
      return Promise.resolve({
        data: mockData.tables,
        status: 200
      });
    } else if (method === 'post') {
      // Create table
      const table = { ...data, created_at: new Date().toISOString() };
      mockData.tables.push(table);
      mockData.records[table.name] = [];
      return Promise.resolve({
        data: table,
        status: 201
      });
    }
  }
  
  // Mock get specific table schema
  if (url.includes('/schema/tables/') && method === 'get' && !url.endsWith('/schema/tables')) {
    const tableName = decodeURIComponent(urlParts[urlParts.length - 1]);
    const table = mockData.tables.find(t => t.name === tableName);
    if (table) {
      return Promise.resolve({
        data: {
          name: table.name,
          columns: table.columns,
          row_count: mockData.records[table.name]?.length || 0,
          size: 0,
          created_at: table.created_at,
          updated_at: table.created_at,
          permissions: { read: [], write: [], delete: [] },
          triggers: [],
          metadata: {}
        },
        status: 200
      });
    }
    return Promise.reject(new Error('Table not found'));
  }
  
  // Mock delete table
  if (url.includes('/schema/tables/') && method === 'delete') {
    const tableName = decodeURIComponent(urlParts[urlParts.length - 1]);
    const index = mockData.tables.findIndex(t => t.name === tableName);
    if (index !== -1) {
      mockData.tables.splice(index, 1);
      delete mockData.records[tableName];
      return Promise.resolve({
        data: { message: 'Table dropped' },
        status: 200
      });
    }
  }
  
  // Mock data operations
  const tableMatch = url.match(/\/data\/([^\/]+)/);
  if (tableMatch) {
    const tableName = decodeURIComponent(tableMatch[1]);
    
    // Check for invalid table names
    if (tableName.includes(' ')) {
      return Promise.reject({
        response: {
          status: 400,
          data: { error: 'Invalid table name' }
        }
      });
    }
    
    if (method === 'post') {
      // Insert
      if (Array.isArray(data)) {
        const results = data.map(item => ({
          ...item,
          id: generateId(),
          created_at: new Date().toISOString()
        }));
        mockData.records[tableName] = [...(mockData.records[tableName] || []), ...results];
        return Promise.resolve({
          data: results,
          status: 201
        });
      } else {
        const result = {
          ...data,
          id: generateId(),
          created_at: new Date().toISOString()
        };
        mockData.records[tableName] = [...(mockData.records[tableName] || []), result];
        return Promise.resolve({
          data: result,
          status: 201
        });
      }
    } else if (method === 'get') {
      // Select
      const records = mockData.records[tableName] || [];
      let result = [...records];
      
      // Handle query parameters
      const params = config.params || {};
      if (params.where) {
        // Handle where filtering - can be array of filters or object
        let whereFilters = params.where;
        if (typeof params.where === 'string') {
          whereFilters = JSON.parse(params.where);
        }
        
        // If it's an array of filters (QueryFilter[])
        if (Array.isArray(whereFilters)) {
          result = result.filter(record => {
            return whereFilters.every(filter => {
              const { field, operator, value } = filter;
              switch (operator) {
                case 'eq':
                  return record[field] === value;
                case 'neq':
                  return record[field] !== value;
                case 'gt':
                  return record[field] > value;
                case 'gte':
                  return record[field] >= value;
                case 'lt':
                  return record[field] < value;
                case 'lte':
                  return record[field] <= value;
                case 'like':
                  return String(record[field]).includes(value);
                default:
                  return true;
              }
            });
          });
        } else if (typeof whereFilters === 'object') {
          // Simple object where clause
          result = result.filter(record => {
            return Object.entries(whereFilters).every(([key, value]) => {
              return record[key] === value;
            });
          });
        }
      }
      
      if (params.select && params.select !== '*') {
        // Column selection
        const columns = params.select.split(',');
        result = result.map(record => {
          const filtered = {};
          columns.forEach(col => {
            if (col in record) filtered[col] = record[col];
          });
          return filtered;
        });
      }
      
      if (params.order || params.orderBy) {
        // Ordering - can be string or array
        const orderParam = params.order || params.orderBy;
        let orderFields = [];
        
        if (typeof orderParam === 'string') {
          orderFields = [{ column: orderParam.split(':')[0], direction: orderParam.split(':')[1] || 'asc' }];
        } else if (Array.isArray(orderParam)) {
          orderFields = orderParam.map(o => ({
            column: o.column || o.field,
            direction: o.direction || 'asc'
          }));
        }
        
        result.sort((a, b) => {
          for (const order of orderFields) {
            const aVal = a[order.column];
            const bVal = b[order.column];
            if (aVal !== bVal) {
              if (order.direction === 'desc') {
                return bVal > aVal ? 1 : -1;
              }
              return aVal > bVal ? 1 : -1;
            }
          }
          return 0;
        });
      }
      
      if (params.limit) {
        result = result.slice(0, parseInt(params.limit));
      }
      
      return Promise.resolve({
        data: result,
        status: 200
      });
    } else if (method === 'patch') {
      // Update - handle both single record and batch updates
      const isIdUpdate = url.includes('/data/') && urlParts[urlParts.length - 1] !== tableName;
      
      if (isIdUpdate) {
        // Single record update by ID
        const recordId = urlParts[urlParts.length - 1];
        const records = mockData.records[tableName] || [];
        const index = records.findIndex(r => r.id === recordId);
        
        if (index !== -1) {
          mockData.records[tableName][index] = { 
            ...records[index], 
            ...data, 
            updated_at: new Date().toISOString() 
          };
          return Promise.resolve({
            data: mockData.records[tableName][index],
            status: 200
          });
        }
        
        return Promise.reject({ response: { status: 404, data: { error: 'Record not found' } } });
      } else {
        // Batch update with where conditions
        const records = mockData.records[tableName] || [];
        const updatedRecords = [];
        const whereConditions = data.where || [];
        
        mockData.records[tableName] = records.map(record => {
          let shouldUpdate = false;
          
          if (Array.isArray(whereConditions)) {
            shouldUpdate = whereConditions.every(filter => {
              const { field, operator, value } = filter;
              switch (operator) {
                case 'eq': return record[field] === value;
                case 'gt': return record[field] > value;
                case 'gte': return record[field] >= value;
                case 'lt': return record[field] < value;
                case 'lte': return record[field] <= value;
                default: return true;
              }
            });
          }
          
          if (shouldUpdate) {
            const updatedRecord = { ...record, ...data.data, updated_at: new Date().toISOString() };
            updatedRecords.push(updatedRecord);
            return updatedRecord;
          }
          return record;
        });
        
        return Promise.resolve({
          data: updatedRecords,
          status: 200
        });
      }
    } else if (method === 'delete') {
      // Delete
      const records = mockData.records[tableName] || [];
      let deleted = 0;
      const params = config.params || {};
      
      if (params && params.where) {
        const whereFilters = typeof params.where === 'string' 
          ? JSON.parse(params.where) 
          : params.where;
          
        mockData.records[tableName] = records.filter(record => {
          let shouldDelete = false;
          
          if (Array.isArray(whereFilters)) {
            shouldDelete = whereFilters.every(filter => {
              const { field, operator, value } = filter;
              if (operator === 'eq') return record[field] === value;
              return true;
            });
          } else {
            shouldDelete = Object.entries(whereFilters).every(([key, value]) => {
              return record[key] === value;
            });
          }
          
          if (shouldDelete) {
            deleted++;
            return false;
          }
          return true;
        });
      }
      
      return Promise.resolve({
        data: { count: deleted },
        status: 200
      });
    }
  }
  
  // Mock count
  if (url.includes('/count')) {
    const tableName = decodeURIComponent(url.match(/\/data\/([^\/]+)/)[1]);
    let records = mockData.records[tableName] || [];
    
    // Apply where filters if present  
    const params = config.params || {};
    if (params.where) {
      const whereFilters = typeof params.where === 'string' 
        ? JSON.parse(params.where) 
        : params.where;
        
      if (Array.isArray(whereFilters) && whereFilters.length > 0) {
        records = records.filter(record => {
          return whereFilters.every(filter => {
            const { field, operator, value } = filter;
            switch (operator) {
              case 'eq': return record[field] === value;
              case 'gt': return record[field] > value;
              case 'gte': return record[field] >= value;
              case 'lt': return record[field] < value;
              case 'lte': return record[field] <= value;
              default: return true;
            }
          });
        });
      }
    }
    
    return Promise.resolve({
      data: { count: records.length },
      status: 200
    });
  }
  
  // Mock aggregations
  if (url.includes('/aggregate')) {
    const tableName = decodeURIComponent(url.match(/\/data\/([^\/]+)/)[1]);
    const records = mockData.records[tableName] || [];
    const responseData = {};
    
    // Handle different aggregate functions
    if (data.sum) {
      data.sum.forEach(field => {
        responseData[`sum_${field}`] = records.reduce((sum, record) => sum + (Number(record[field]) || 0), 0);
      });
    }
    
    if (data.avg) {
      data.avg.forEach(field => {
        const sum = records.reduce((sum, record) => sum + (Number(record[field]) || 0), 0);
        responseData[`avg_${field}`] = records.length > 0 ? sum / records.length : 0;
      });
    }
    
    if (data.min) {
      data.min.forEach(field => {
        const values = records.map(r => Number(r[field]) || 0).filter(v => v !== null && v !== undefined);
        responseData[`min_${field}`] = values.length > 0 ? Math.min(...values) : null;
      });
    }
    
    if (data.max) {
      data.max.forEach(field => {
        const values = records.map(r => Number(r[field]) || 0).filter(v => v !== null && v !== undefined);
        responseData[`max_${field}`] = values.length > 0 ? Math.max(...values) : null;
      });
    }
    
    return Promise.resolve({
      data: responseData,
      status: 200
    });
  }
  
  // Mock search
  if (url.includes('/search')) {
    const tableName = url.match(/\/data\/([^\/]+)/)[1];
    const records = mockData.records[tableName] || [];
    const searchTerm = (data.query || data.q || '').toLowerCase();
    const searchFields = data.fields || [];
    
    const results = records.filter(record => {
      if (searchFields.length > 0) {
        // Search only in specified fields
        return searchFields.some(field => {
          const value = record[field];
          return value && String(value).toLowerCase().includes(searchTerm);
        });
      } else {
        // Search in all fields
        return Object.values(record).some(value => 
          value && String(value).toLowerCase().includes(searchTerm)
        );
      }
    });
    
    return Promise.resolve({
      data: { results: results, total: results.length },
      status: 200
    });
  }
  
  // Mock batch operations
  if (url.includes('/batch')) {
    const results = [];
    for (const operation of data.operations) {
      // Simplified batch handling
      results.push({ success: true, operation });
    }
    return Promise.resolve({
      data: { results },
      status: 200
    });
  }
  
  // Default mock response
  return Promise.resolve({
    data: {},
    status: 200
  });
});

// Mock other axios methods
mockAxios.get = jest.fn((url, config) => mockAxios.request({ ...config, method: 'get', url }));
mockAxios.post = jest.fn((url, data, config) => mockAxios.request({ ...config, method: 'post', url, data }));
mockAxios.put = jest.fn((url, data, config) => mockAxios.request({ ...config, method: 'put', url, data }));
mockAxios.patch = jest.fn((url, data, config) => mockAxios.request({ ...config, method: 'patch', url, data }));
mockAxios.delete = jest.fn((url, config) => mockAxios.request({ ...config, method: 'delete', url }));

// Reset mock data
mockAxios.mockReset = () => {
  // Clear all data
  mockData.tables = [];
  mockData.records = {};
  
  // Re-add base test data
  const testTableName = 'test_users';
  mockData.tables.push({
    name: testTableName,
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'email', type: 'varchar', unique: true, required: true },
      { name: 'name', type: 'varchar', required: true },
      { name: 'age', type: 'integer' }
    ],
    created_at: new Date().toISOString()
  });
  mockData.records[testTableName] = [
    { id: '1', email: 'test1@example.com', name: 'Test User 1', age: 25 },
    { id: '2', email: 'test2@example.com', name: 'Test User 2', age: 30 },
    { id: '3', email: 'test3@example.com', name: 'Test User 3', age: 35 }
  ];
};

module.exports = mockAxios;