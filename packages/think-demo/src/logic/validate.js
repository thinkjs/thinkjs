let METHOD_MAP = {
  'GET': 'param',
  'POST': 'post',
  'FILE': 'file'
};

let output = (that, rules, msgs) => {
  let ctxMethod = that.ctx.method.toUpperCase();
  let ret = msgs ? that.validate(rules, msgs) : that.validate(rules);
  if(!ret) {
    console.log(that.validateErrors);
  }else {
    console.log('Validate Pass:',that.ctx[METHOD_MAP[ctxMethod]]());
  }
}

module.exports = class IndexLogic extends think.Logic {
  __before() {

  }

  newAction() {
    let rules = {
      username: {
        newrule: 'hello'
      }
    }
    output(this, rules);
  }

  indexAction() {
    let rules = {
      username: {
        required: true
      }
    };
    output(this, rules);
  }

  postAction() {
    let rules = {
      username: {
        required: true,
        method: 'post'
      }
    };
    output(this, rules);
  }

  trimAction() {
    let rules = {
      username: {
        required: true,
        trim: true,
        default: 'Tom   '
      }
    };
    output(this, rules);
  }

  parseAction() {
    let rules = {
      username: {
        requiredIf: ['name', 'lushijie', 'tom']
      }
    };
    output(this, rules);
  }

  convertAction() {
    let rules = {
      num: {
        float: true,
        default: '12.09'
      },
      flag: {
        boolean: true,
        default: 'yes'
      },
      list: {
        array: true,
        default: 'tom'
      }
    };
    output(this, rules);
  }

  arrayAction() {
    let rules = {
      list: {
        array: true,
        children: {
          int: true,
          default: 666
        },
        default: ['1', '3', '']
      }
    };
    output(this, rules);
  }

  objectAction() {
    let rules = {
      obj: {
        object: true,
        children: {
          int: true,
          trim: true,
          default: 666
        },
        default: {a: '123', b: '456  ', c: ''}
      }
    };
    output(this, rules);
  }

  errmsgAction() {
    let rules = {
      notice: {
        required: true
      },
      username: {
        required: true
      },
      email: {
        required: true
      },
      obj: {
        object: true,
        children: {
          int: true
        },
        default: {
          a: 'a',
          b: 'b',
          c: 'c',
          d: 'd',
          e: '23'
        }
      }
    };

    let msgs = {
      required: 'This is required error message',
      username: 'This is username error message',
      email: {
        required: 'This is email error message'
      },
      obj: {
        'a': {
          int: 'This is error message for obj.a.int'
        },
        'b': 'This is error message for obj.b',
        'c,d': 'This is error message for obj.c & obj.d'
      }
    }
    output(this, rules, msgs);
  }

  allowAction() {
    this.allowMethods = 'POST';
  }


}
