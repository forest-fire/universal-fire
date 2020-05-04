# Environment Variables

We allow certain environment variables to help configure your setup. This is typically used _as a fallback to_ the explicit configuration you can pass into the constructor but unlike explicit setting of variables, using an external prompt like environment variables allows you to better adapt the same code to different circumstance based on 

## Logging

One of the most common settings in the node world is `NODE_ENV` and when you move to AWS's serverless sometimes `AWS_STAGE` is used in it's place. Both variables indicate in which workflow stage your code is executing in and typically fits into a value of `dev` / `development`, `test`, `stage`, or `prod` / `production`.

This library recognizes these variables for _logging_ purposes. In general this library doesn't do too much logging because instead it prefers to throw errors with verbose descriptions but there are cases where logging a message is appropriate but an error is too severe. Whether this error should be muted or presented will depend on the stage. By default the following rules will be applied (using the standard Unix "severity" gauge):

- **debug** - only presented in _development_
- **info** - presented in _development_ and _test_
- **warn** - presented in all environments
- **error** - an ERROR will be thrown

### Rolling Your Own Severity Config

If you don't like these defaults you can change it whatever you like with the `logging` parameter in the configuration:

```typescript
const logging = {
  debug: ['development', 'test'],
  info: true,
  warn: true
}
const db = DB.connect(RealTimeAdmin, { logging });
```

## Firebase Configuration

Another part of the configuration which you'll likely want to have controlled _externally_ by environment variables is the **Firebase** configuration because you'll want to be able keep the code unchanged and then use these variables to indicate _which_ database to connect to.

### Admin versus Client SDK

In Firebase, the configuration for the Admin SDK and Client SDK are completely different and therefore the environment variables are also different to reflect this. 

#### Admin SDK

There are two key variables for the Admin SDK:

1. Database URL (`FIREBASE_DATABASE_URL`)
2. Service Account (`FIREBASE_SERVICE_ACCOUNT`)

The database URL is quite straight forward, it is a string with the URL which uniquely identifies your database. Nothing fancy to know there. The Service Account is a JSON object[1] which includes your private key (amoungst other things). With this you do want take care that this variable is not stored in any repository as this is the most common security breach out there. Furthermore because environment variables can only store _strings_ you must remove all carraige returns in it. The first way a lot of people think of doing this is to use `JSON.stringify(serviceAccount)`. You can do that and then store this variable into an ENV variable. The JSON format, however, is somewhat less preferable (due to quotation marks and a few other edge cases) to a BASE64 representation. There are a million _online_ converters so we suggest just cutting and pasting the JSON text that google gives you into one and then using the BASE64 text representation.

There is one edge case that you should be aware of but _probably_ will not be an issue for you. That is that ENV variables have a set length that is OS dependant. The BASE64 encoded service account variables will likely be 1-3k characters in length. Linux typically has a default limit of 16kb (though can be extended), Windows defaults to 32k, and MacOS -- which annoyingly I couldn't find a full answer for based on google searches -- is likely at least the amount allocated for Linux.

[1] google gives you a "pretty printed" version which has carraige returns and therefore can not just be used; instead to use as JSON you must remove all carraige returns.

#### Client SDK

Unlike the Admin SDK which carries cryptographic secrets, the client SDK is fully secret-free because we can't trust those darn browsers. That also means that in all likelihood you shouldn't really need environment variables but instead you can just build the logic into a file you keep in your repo. If you are determined that you MUST use
environment variables, because -- I don't know -- you _care about the environment_ ... then you can set the `FIREBASE_CLIENT_CONFIG` variable instead of passing the environment variable into the static initializer but bear in mind that the client config is an object too and therefore you'll need to convert it to a BASE64 (or JSON string) before setting it.

```typescript
const config = Buffer.from({
  ...
}, 'base64').toString();
process.env.FIREBASE_CLIENT_CONFIG = config;
const db = DB.connect(FirestoreClient)
```

Seems like a lot of work. We're against work but we _are_ for the environment. For this reason we're happy to say you can avoid environment variables (and work) for the client and still be good to the environment ... start with recycling and then go from there.