# think-apollo-graphql

# think-apollo-graphql
[![npm](https://img.shields.io/npm/v/think-apollo-graphql.svg?style=flat-square)](https://www.npmjs.com/package/think-apollo-graphql)

## Install

```
npm install think-apollo-graphql
```
## How to use

Set the extend in `src/config/extend.js`

```js
const graphql = require('think-apollo-graphql');

module.exports = [
  graphql
];
```

And then the `think`, `controller` will have the method `thinkGraphql`. For
example in `controller` you can use like this:


```js
module.exports = class extends think.Controller {
  constructor(...props) {
    super(...props);
  }

  async indexAction() {
    const graphqlResult = await this.thinkGraphql(graphqlOptions);
    return this.json(graphqlResult);
  }
}
```

Note: `think.thinkGraphql(graphqlOptions, ctx)`, think.thinkGraphql expects exactly ctx.


#### graphqlOptions like:

```js
{
  schema: the GraphQLSchema to be used
  context: the context value passed to resolvers during GraphQL execution
  rootValue: the value passed to the first resolve function
  formatError: a function to apply to every error before sending the response to clients
  validationRules: additional GraphQL validation rules to be applied to client-specified queries
  formatParams: a function applied for each query in a batch to format parameters before execution
  formatResponse: a function applied to each response after execution
  tracing: when set to true, collect and expose trace data in the Apollo Tracing format
}
```

More doc at [apollo-server](https://github.com/apollographql/apollo-server).
