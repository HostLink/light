# HostLink Light Cient

A javascript library for Light Framework.


## Installation

```bash
npm install @hostlink/light
```

## Usage

```javascript
import { createClient } from '@hostlink/light';

const client=createClient('https://example.com/api');

```

## Login

```javascript
await client.auth.login('username','password');
```

## Logout

```javascript
await client.auth.logout();
```






