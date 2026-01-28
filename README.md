# @hostlink/light

A lightweight JavaScript/TypeScript client library for the **Light Framework**, providing an easy-to-use API for GraphQL queries/mutations, authentication, file management, user management, and more.

## Features

- 🔐 **Authentication** - Login/logout, password management, OAuth (Google, Facebook, Microsoft), WebAuthn support
- 📊 **GraphQL Client** - Simplified query and mutation APIs with automatic file upload handling
- 📁 **File System** - Complete file and folder management operations
- 👥 **User Management** - CRUD operations for users and roles
- 📧 **Email** - Send emails via the backend
- 🔄 **Token Refresh** - Automatic access token refresh with request queuing
- 🌐 **Universal** - Works in both browser and Node.js environments

## Installation

```bash
npm install @hostlink/light
```

## Quick Start

```typescript
import { createClient } from '@hostlink/light';

// Create a client instance
const api = createClient('https://your-api.com/graphql');

// Login
await api.auth.login('username', 'password');

// Query data
const users = await api.query({
  app: {
    users: {
      user_id: true,
      username: true,
      first_name: true
    }
  }
});

// Logout
await api.auth.logout();
```

## API Reference

### Creating a Client

```typescript
import { createClient } from '@hostlink/light';

const api = createClient('https://your-api.com/graphql');
```

The client provides:
- `api.auth` - Authentication methods
- `api.query` - GraphQL queries
- `api.mutation` - GraphQL mutations
- `api.users` - User management
- `api.roles` - Role management
- `api.mail` - Email sending
- `api.config` - Configuration access
- `api.collect` - Collection builder
- `api.list` - List builder

---

### Authentication

#### Basic Login/Logout

```typescript
// Login with username and password
await api.auth.login('username', 'password');

// Login with 2FA code
await api.auth.login('username', 'password', '123456');

// Logout
await api.auth.logout();
```

#### Get Current User

```typescript
const user = await api.auth.getCurrentUser();
// Returns: { user_id, username, first_name, last_name, status }

// With custom fields
const user = await api.auth.getCurrentUser({
  user_id: true,
  username: true,
  email: true
});
```

#### Password Management

```typescript
// Update password
await api.auth.updatePassword('oldPassword', 'newPassword');

// Change expired password
await api.auth.changeExpiredPassword('username', 'oldPassword', 'newPassword');

// Forgot password flow
const jwt = await api.auth.forgetPassword('username', 'email@example.com');
await api.auth.verifyCode(jwt, '123456');
await api.auth.resetPassword(jwt, 'newPassword', '123456');
```

#### OAuth Providers

```typescript
// Google
await api.auth.google.login(credential);
await api.auth.google.register(credential);
await api.auth.google.unlink();

// Facebook
await api.auth.facebook.login(accessToken);
await api.auth.facebook.register(accessToken);
await api.auth.facebook.unlink();

// Microsoft
await api.auth.microsoft.login(accessToken);
await api.auth.microsoft.register(accountId);
await api.auth.microsoft.unlink();
```

#### WebAuthn (Passkeys)

```typescript
import { webAuthn } from '@hostlink/light';

// Register a new passkey
await webAuthn.register();

// Login with passkey
await webAuthn.login();
```

#### Permission Checking

```typescript
// Check single permission
const canEdit = await api.auth.isGranted('edit_users');

// Check multiple permissions
const rights = await api.auth.grantedRights(['edit_users', 'delete_users']);
```

---

### GraphQL Queries & Mutations

#### Query

```typescript
const result = await api.query({
  app: {
    users: {
      user_id: true,
      username: true,
      profile: {
        avatar: true,
        bio: true
      }
    }
  }
});
```

#### Mutation

```typescript
const result = await api.mutation({
  createPost: {
    __args: {
      title: 'Hello World',
      content: 'My first post'
    }
  }
});
```

#### File Upload

File uploads are automatically handled in mutations:

```typescript
// Single file upload
await api.mutation({
  uploadAvatar: {
    __args: {
      file: fileInput.files[0]
    }
  }
});

// Multiple file upload
await api.mutation({
  uploadImages: {
    __args: {
      files: Array.from(fileInput.files)
    }
  }
});
```

---

### Collection & List Builders

#### createList - Simple List Queries

```typescript
import { createList } from '@hostlink/light';

// Create a list query
const users = await createList('Users', {
  user_id: true,
  username: true,
  first_name: true
})
  .where('status', 1)
  .where('role', 'admin')
  .sort('-created_at')
  .limit(10)
  .fetch();

// Get first item
const user = await createList('Users', { user_id: true, username: true })
  .where('username', 'john')
  .first();
```

#### Where Clauses

```typescript
list
  .where('status', 1)              // Exact match
  .where('age', '>', 18)           // Greater than
  .where('age', '>=', 18)          // Greater than or equal
  .where('age', '<', 65)           // Less than
  .where('age', '<=', 65)          // Less than or equal
  .where('status', '!=', 0)        // Not equal
  .whereIn('role', ['admin', 'moderator'])  // In array
  .whereContains('name', 'john')   // Contains string
  .whereBetween('age', 18, 65)     // Between range
```

#### createCollection - Advanced Collection Operations

```typescript
import { createCollection } from '@hostlink/light';

const collection = createCollection('Products', {
  id: true,
  name: true,
  price: true,
  category: true
});

// Filter and transform data
const result = await collection
  .where('category', '==', 'electronics')
  .where('price', '<', 1000)
  .sortBy('price')
  .map(item => ({ ...item, discounted: item.price * 0.9 }))
  .all();

// Aggregations
const avgPrice = await collection.avg('price');
const total = await collection.count();
const maxPrice = await collection.max('price');
```

---

### User Management

```typescript
// List users
const users = await api.users.list();

// Create user
await api.users.create({
  username: 'newuser',
  first_name: 'John',
  last_name: 'Doe',
  password: 'securepassword',
  join_date: '2024-01-01'
});

// Update user
await api.users.update(userId, {
  first_name: 'Jane'
});

// Delete user
await api.users.delete(userId);
```

---

### Role Management

```typescript
// List roles
const roles = await api.roles.list();

// Create role with child roles
await api.roles.create('admin', ['editor', 'viewer']);

// Delete role
await api.roles.delete('admin');
```

---

### File System API

For direct filesystem access:

```typescript
import { fs } from '@hostlink/light';

// Create folder
await fs.createFolder('/path/to/folder');

// Delete folder
await fs.deleteFolder('/path/to/folder');

// Rename folder
await fs.renameFolder('/path/to/folder', 'newName');

// Write file
await fs.writeFile('/path/to/file.txt', 'content');

// Upload file
await fs.uploadFile('/path/to/destination', file);

// Delete file
await fs.deleteFile('/path/to/file.txt');

// Check if exists
const exists = await fs.exists('/path/to/file.txt');

// Move file/folder
await fs.move('/from/path', '/to/path');

// Search files
const results = await fs.find('searchterm', 'document'); // labels: document, image, audio, video, archive
```

---

### Email

```typescript
await api.mail.send(
  'recipient@example.com',
  'Subject Line',
  'Email message body'
);
```

---

### Model Helper

Create reusable model definitions:

```typescript
import model from '@hostlink/light';

const Product = model('Product', {
  id: { name: 'product_id' },
  name: { gql: { name: true } },
  price: { gql: { price: true, currency: true } }
});

// CRUD operations
await Product.add({ name: 'New Product', price: 99.99 });
await Product.update(1, { price: 89.99 });
await Product.delete(1);
const product = await Product.get({ id: 1 }, { name: true, price: true });
const products = await Product.list({ name: true, price: true }).fetch();
```

---

## Advanced Configuration

### Direct API Client Access

```typescript
import { setApiClient, getApiClient } from '@hostlink/light';

// Set a custom API client
setApiClient(customClient);

// Get the current API client
const client = getApiClient();

// Access the underlying axios instance
const { axios } = getApiClient();
```

### Token Refresh

The client automatically handles token refresh when receiving `TOKEN_EXPIRED` errors. Failed requests are queued and retried after the token is refreshed.

---

## TypeScript Support

This library is written in TypeScript and includes full type definitions.

```typescript
import type { 
  UserFields, 
  CreateUserFields,
  QueryUserFieldsUserFields,
  RoleFields,
  FileFields,
  FolderFields,
  GraphQLQuery
} from '@hostlink/light';
```

---

## License

MIT

## Repository

[https://github.com/HostLink/light](https://github.com/HostLink/light)






