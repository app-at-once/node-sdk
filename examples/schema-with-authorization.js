/**
 * Example: Database Schema with Authorization Rules
 * 
 * This example demonstrates how to define authorization rules
 * for your database tables using AppAtOnce's Row Level Security (RLS)
 */

// Example 1: Basic User-Owned Records
const blogSchema = {
  posts: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'title', type: 'string', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'published', type: 'boolean', default: false },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    // Authorization rules - users can only manage their own posts
    authorization: {
      enableRLS: true,
      rules: {
        read: 'auth.user_id == resource.user_id || resource.published == true', // Own posts or published posts
        write: 'auth.user_id != null', // Any authenticated user can create
        update: 'auth.user_id == resource.user_id', // Only owner can update
        delete: 'auth.user_id == resource.user_id' // Only owner can delete
      }
    }
  },
  
  comments: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'post_id', type: 'uuid', nullable: false, references: { table: 'posts' } },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        read: 'true', // Anyone can read comments
        write: 'auth.user_id != null', // Authenticated users can comment
        update: 'auth.user_id == resource.user_id', // Only author can edit
        delete: 'auth.user_id == resource.user_id || auth_has_role("moderator")' // Author or moderator
      }
    }
  }
};

// Example 2: Role-Based Access Control
const adminSchema = {
  products: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'decimal', nullable: false },
      { name: 'inventory', type: 'integer', default: 0 }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        read: 'true', // Public read access
        write: 'auth_has_role("admin") || auth_has_role("manager")',
        update: 'auth_has_role("admin") || auth_has_role("manager")',
        delete: 'auth_has_role("admin")' // Only admins can delete
      }
    }
  },
  
  orders: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'total', type: 'decimal', nullable: false },
      { name: 'status', type: 'string', default: 'pending' }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        read: 'auth.user_id == resource.user_id || auth_has_role("admin") || auth_has_role("support")',
        write: 'auth.user_id != null', // Any authenticated user can create orders
        update: 'auth_has_role("admin") || (auth.user_id == resource.user_id && resource.status == "pending")',
        delete: 'auth_has_role("admin")' // Only admins can delete orders
      }
    }
  }
};

// Example 3: Organization-Based Access (Multi-Tenant)
const organizationSchema = {
  projects: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false },
      { name: 'org_id', type: 'uuid', nullable: false },
      { name: 'owner_id', type: 'uuid', nullable: false },
      { name: 'is_public', type: 'boolean', default: false }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        // Users can read projects in their org or public projects
        read: 'auth.app_metadata.org_id == resource.org_id || resource.is_public == true',
        // Users in the org can create projects
        write: 'auth.app_metadata.org_id != null',
        // Project owner or org admin can update
        update: 'auth.user_id == resource.owner_id || auth_has_role("org_admin")',
        // Only org admins can delete
        delete: 'auth_has_role("org_admin") && auth.app_metadata.org_id == resource.org_id'
      }
    }
  },
  
  project_members: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'project_id', type: 'uuid', nullable: false, references: { table: 'projects' } },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'role', type: 'string', default: 'member' },
      { name: 'invited_by', type: 'uuid', nullable: false }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        // Project members can see other members
        read: `EXISTS (
          SELECT 1 FROM project_members pm 
          WHERE pm.project_id = resource.project_id 
          AND pm.user_id = auth.user_id
        )`,
        // Project owners and admins can add members
        write: `EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = resource.project_id 
          AND (p.owner_id = auth.user_id OR auth_has_role("org_admin"))
        )`,
        update: 'auth.user_id == resource.invited_by || auth_has_role("org_admin")',
        delete: 'auth.user_id == resource.invited_by || auth_has_role("org_admin")'
      }
    }
  }
};

// Example 4: Public Read, Authenticated Write
const publicContentSchema = {
  articles: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'title', type: 'string', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'author_id', type: 'uuid', nullable: false },
      { name: 'published_at', type: 'timestamptz', nullable: true }
    ],
    authorization: {
      enableRLS: true,
      rules: {
        read: 'true', // Public read access
        write: 'auth.user_id != null', // Any authenticated user can write
        update: 'auth.user_id == resource.author_id', // Only author can update
        delete: 'auth.user_id == resource.author_id || auth_has_role("admin")'
      }
    }
  }
};

// Export examples
module.exports = {
  blogSchema,
  adminSchema,
  organizationSchema,
  publicContentSchema
};

// Usage with AppAtOnce SDK
/*
const { AppAtOnceClient } = require('@appatonce/node-sdk');

const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);

// Apply the schema with authorization
async function applySchema() {
  const result = await client.schema.migrate(blogSchema);
  console.log('Migration result:', result);
}

// The authorization rules will be automatically converted to PostgreSQL RLS policies
// Users will need to be authenticated and their auth context will be set automatically
// when they make queries through the SDK
*/