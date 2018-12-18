/**
 * Outside of debug builds, transform:
 *
 *    log.debug('some debug message');
 *
 * into:
 *
 *    void 0;
 *
 */
module.exports = function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          if (state.opts.env === 'development') {
            return;
          }
          const callee = path.get('callee');
          if (
            callee.isMemberExpression() &&
            callee.get('object').isIdentifier({name: 'log'}) &&
            callee.get('property').isIdentifier({name: 'debug'})
          ) {
            const noop = t.unaryExpression('void', t.numericLiteral(0));
            path.replaceWith(noop);
          }
        }
      }
    }
  };
};
