#!/bin/bash

# Fix all API endpoints to use /api/v1 prefix

echo "Fixing API endpoints in SDK..."

# Fix schema module
sed -i '' 's|/api/schema/|/api/v1/schema/|g' src/modules/schema.ts

# Fix index.ts ping endpoint
sed -i '' 's|/api/ping|/api/v1/ping|g' src/index.ts

# Fix query builder
sed -i '' 's|/api/data/|/api/v1/data/|g' src/core/query-builder.ts

# Fix all other modules
find src/modules -name "*.ts" -type f -exec sed -i '' 's|/api/|/api/v1/|g' {} \;

# Also add dropTable method to schema module
cat >> src/modules/schema.ts << 'EOF'

  // Alias for deleteTable to match common naming conventions
  async dropTable(tableName: string, options?: {
    cascade?: boolean;
    backup?: boolean;
  }): Promise<{
    deleted: boolean;
    rows_deleted: number;
    backup_created?: boolean;
    backup_url?: string;
  }> {
    return this.deleteTable(tableName, options);
  }
EOF

echo "Endpoints fixed!"