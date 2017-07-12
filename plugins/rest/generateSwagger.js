const require_all = require('require-all'),
  path = require('path'),
  _ = require('lodash'),
  config = require('../../config'),
  transactionModel = require('../../models/transactionModel'),
  accountModel = require('../../models/accountModel'),
  contracts = require_all({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
    dirname: path.join(__dirname, '../../node_modules', 'chronobank-smart-contracts/build/contracts'),
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/
  });

let definition = _.chain(contracts)
  .map(value => //fetch all events
    _.chain(value).get('abi')
      .filter({type: 'event'})
      .value()
  )
  .flatten()
  .uniqBy('name') //remove duplicates
  .transform((result, ev) => {
    result[`/events/${ev.name}`] = {
      get: {
        tags: [
          'event'
        ],
        summary: 'Retrieve all event\'s records',
        produces: [
          'application/json'
        ],
        parameters: _.chain(ev.inputs)
          .transform((result, obj) => {
            result.push({
              name: obj.name,
              in: 'query',
              required: false,
              type: new RegExp(/uint/).test(obj.type) ?
                'integer' : 'string'
            });
          }, [])
          .union([{
            name: 'controlIndexHash',
            in: 'query',
            required: false,
            type: 'string'
          }, {
            name: 'network',
            in: 'query',
            required: false,
            type: 'string'
          }, {
            name: 'created',
            in: 'query',
            required: false,
            type: 'string',
            format: 'date-time'
          }])
          .value(),
        responses: {
          200: {
            description: 'successful operation',
            schema: {
              type: 'object'
            }
          }
        }
      }
    };

  }, {})
  .thru(definition =>
    _.merge({
      '/events': {
        get: {
          tags: [
            'event'
          ],
          summary: 'Retrieve all event\'s records',
          produces: [
            'application/json'
          ],
          responses: {
            200: {
              description: 'successful operation',
              schema: {
                type: 'object'
              }
            }
          }
        }
      },
      '/transactions': {
        get: {
          tags: [
            'transactions'
          ],
          summary: 'Retrieve transactions',
          produces: [
            'application/json'
          ],
          parameters:
            _.transform(transactionModel.schema.obj, (result, obj, name)=>{
              result.push({
                'name': name,
                'in': 'query',
                'required': false,
                'type': obj.type === Number ? 'integer' : 'string'
              });
            }, []),
          responses: {
            200: {
              description: 'successful operation',
              schema: {
                type: 'object'
              }
            }
          }
        }
      },
      '/account': {
        post: {
          tags: [
            'account'
          ],
          summary: 'add new account for transaction listener',
          produces: [
            'application/json'
          ],
          parameters:
            _.transform(accountModel.schema.obj, (result, obj, name)=>{
              result.push({
                'name': name,
                'in': 'body',
                'required': false,
                'type': obj.type === Number ? 'integer' : 'string'
              });
            }, []),
          responses: {
            200: {
              description: 'successful operation',
              schema: {
                type: 'object'
              }
            }
          }
        }
      }
    }, definition)
  )
  .value();

let body = {
  swagger: '2.0',
  info: {
    description: '',
    version: '1.0.0',
    title: 'Middleware'
  },
  host: `${config.rest.domain}:${config.rest.port}`,
  basePath: '/',
  schemes: [
    'http'
  ],
  paths: definition
};


module.exports = {
  definition: body
};
