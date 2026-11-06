"""Reads the Lua configuration files of the MTA clothes resource (config.lua, barbershop.lua, ...).

Only what those files use: assignments `a.b = <table>`, table constructors, strings, numbers, true/false/nil,
`Vector3(...)` / `tocolor(...)` calls and + - * / between numbers. Tables become dicts; a table whose keys are
1..n becomes a list.
"""
import re

_TOKEN = re.compile(r"""
    (?P<ws>\s+)
  | (?P<comment>--\[\[.*?\]\]|--[^\n]*)
  | (?P<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')
  | (?P<number>0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?)
  | (?P<name>[A-Za-z_][A-Za-z0-9_]*)
  | (?P<op>==|~=|<=|>=|\.\.|[{}\[\]()=,;.+\-*/<>#:])
""", re.S | re.X)

_ESCAPES = {'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '\n': '\n'}


def _unquote(s):
    body, out, i = s[1:-1], [], 0
    while i < len(body):
        c = body[i]
        if c == '\\' and i + 1 < len(body):
            n = body[i + 1]
            if n.isdigit():
                j = i + 1
                while j < len(body) and j < i + 4 and body[j].isdigit():
                    j += 1
                out.append(chr(int(body[i + 1:j])))
                i = j
                continue
            out.append(_ESCAPES.get(n, n))
            i += 2
            continue
        out.append(c)
        i += 1
    return ''.join(out)


def _tokens(text):
    pos = 0
    while pos < len(text):
        m = _TOKEN.match(text, pos)
        if not m:
            raise ValueError('Lua: unexpected %r at %d' % (text[pos:pos + 20], pos))
        pos = m.end()
        kind = m.lastgroup
        if kind in ('ws', 'comment'):
            continue
        value = m.group(kind)
        if kind == 'string':
            value = _unquote(value)
        elif kind == 'number':
            value = int(value, 16) if value[:2].lower() == '0x' else (float(value) if any(ch in value for ch in '.eE') else int(value))
        yield kind, value
    yield 'eof', None


class _Parser:
    def __init__(self, text):
        self.toks = list(_tokens(text))
        self.i = 0

    def peek(self, k=0):
        return self.toks[self.i + k]

    def take(self, kind=None, value=None):
        t = self.toks[self.i]
        if (kind and t[0] != kind) or (value is not None and t[1] != value):
            raise ValueError('Lua: expected %s %r, got %r (token %d)' % (kind, value, t, self.i))
        self.i += 1
        return t

    def is_op(self, value):
        t = self.peek()
        return t[0] == 'op' and t[1] == value

    # expressions: only arithmetic over numbers, strings, tables, calls
    def expr(self):
        v = self.term()
        while self.peek()[0] == 'op' and self.peek()[1] in ('+', '-', '..'):
            op = self.take()[1]
            r = self.term()
            v = v + r if op == '+' else (v - r if op == '-' else str(v) + str(r))
        return v

    def term(self):
        v = self.unary()
        while self.peek()[0] == 'op' and self.peek()[1] in ('*', '/'):
            op = self.take()[1]
            r = self.unary()
            v = v * r if op == '*' else v / r
        return v

    def unary(self):
        if self.is_op('-'):
            self.take()
            return -self.unary()
        return self.atom()

    def atom(self):
        kind, value = self.peek()
        if kind in ('string', 'number'):
            self.take()
            return value
        if kind == 'op' and value == '{':
            return self.table()
        if kind == 'op' and value == '(':
            self.take()
            v = self.expr()
            self.take('op', ')')
            return v
        if kind == 'name':
            self.take()
            if value == 'true':
                return True
            if value == 'false':
                return False
            if value == 'nil':
                return None
            name = value
            while self.is_op('.'):
                self.take()
                name += '.' + self.take('name')[1]
            if self.is_op('('):
                self.take()
                args = []
                while not self.is_op(')'):
                    args.append(self.expr())
                    if self.is_op(','):
                        self.take()
                self.take('op', ')')
                return {'__call': name, 'args': args}
            return {'__ref': name}
        raise ValueError('Lua: unexpected %r' % (self.peek(),))

    def table(self):
        self.take('op', '{')
        result, n = {}, 0
        while not self.is_op('}'):
            if self.is_op('['):
                self.take()
                key = self.expr()
                self.take('op', ']')
                self.take('op', '=')
                result[key] = self.expr()
            elif self.peek()[0] == 'name' and self.peek(1) == ('op', '='):
                key = self.take()[1]
                self.take('op', '=')
                result[key] = self.expr()
            else:
                n += 1
                result[n] = self.expr()
            if self.is_op(',') or self.is_op(';'):
                self.take()
        self.take('op', '}')
        return _listify(result)

    def chunk(self):
        env = {}
        while self.peek()[0] != 'eof':
            if self.peek() == ('name', 'local'):
                self.take()
            name = self.take('name')[1]
            path = [name]
            while self.is_op('.'):
                self.take()
                path.append(self.take('name')[1])
            self.take('op', '=')
            value = self.expr()
            node = env
            for p in path[:-1]:
                node = node.setdefault(p, {})
            node[path[-1]] = value
        return env


def _listify(d):
    if d and all(isinstance(k, int) for k in d) and sorted(d) == list(range(1, len(d) + 1)):
        return [d[k] for k in range(1, len(d) + 1)]
    return d


def parse_files(paths):
    """All assignments of the files, merged (config.x = ... in a later file adds to `config`)."""
    env = {}
    for path in paths:
        with open(path, 'rb') as f:
            raw = f.read()
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError:
            text = raw.decode('latin-1')
        part = _Parser(text).chunk()
        _merge(env, part)
    return env


def _merge(a, b):
    for k, v in b.items():
        if k in a and isinstance(a[k], dict) and isinstance(v, dict):
            _merge(a[k], v)
        else:
            a[k] = v
