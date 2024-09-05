# HostLink Light Cient

A javascript library for Light Framework.


## Installation

```bash
npm install @hostlink/light
```

## Usage

```javascript
import { createClient } from '@hostlink/light';

const api=createClient('https://example.com/api');

```

## Login

```javascript
await api.auth.login('username','password');
```

## Logout

```javascript
await api.auth.logout();
```






