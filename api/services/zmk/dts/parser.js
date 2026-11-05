const {
  DtsNode,
  DtsProperty,
  DtsDirective,
  DtsComment,
  DtsDocument
} = require('./ast');

class DtsParser {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.len = input.length;
  }

  parse() {
    const doc = new DtsDocument();

    while (this.pos < this.len) {
      this.skipWhitespace();
      if (this.pos >= this.len) break;

      // Directives (#include, #define, etc.)
      if (this.peek() === '#') {
        const directive = this.parseDirective();
        doc.statements.push(directive);
        continue;
      }

      // Comments
      if (this.peek() === '/' && (this.peek(1) === '*' || this.peek(1) === '/')) {
        const comment = this.parseComment();
        doc.statements.push(comment);
        continue;
      }

      // Root node / { ... }; or reference node &label { ... };
      if (this.peek() === '/' && this.peek(1) !== '*' && this.peek(1) !== '/') {
        const rootNode = this.parseNode('/');
        doc.statements.push(rootNode);
        if (!doc.rootNode) doc.rootNode = rootNode;
        continue;
      }

      // Node or overlay node
      const node = this.parseNode();
      if (node) {
        doc.statements.push(node);
      } else {
        // If unrecognized at top level, skip character
        this.pos++;
      }
    }

    return doc;
  }

  peek(offset = 0) {
    return this.input[this.pos + offset] || '';
  }

  skipWhitespace() {
    while (this.pos < this.len && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  parseDirective() {
    const start = this.pos;
    while (this.pos < this.len && this.input[this.pos] !== '\n') {
      this.pos++;
    }
    const raw = this.input.slice(start, this.pos).trim();
    return new DtsDirective(raw);
  }

  parseComment() {
    if (this.peek(1) === '/') {
      // Single line comment
      const start = this.pos;
      while (this.pos < this.len && this.input[this.pos] !== '\n') {
        this.pos++;
      }
      return new DtsComment(this.input.slice(start, this.pos).trim(), false);
    } else if (this.peek(1) === '*') {
      // Block comment
      const start = this.pos;
      this.pos += 2;
      while (this.pos < this.len && !(this.input[this.pos] === '*' && this.input[this.pos + 1] === '/')) {
        this.pos++;
      }
      if (this.pos < this.len) this.pos += 2;
      return new DtsComment(this.input.slice(start, this.pos), true);
    }
    return null;
  }

  parseNode(explicitName = null) {
    let label = null;
    let name = explicitName;

    if (!name) {
      this.skipWhitespace();
      const token = this.readIdentifierOrRef();
      if (!token) return null;

      this.skipWhitespace();
      if (this.peek() === ':') {
        label = token;
        this.pos++; // skip ':'
        this.skipWhitespace();
        name = this.readIdentifierOrRef() || label;
      } else {
        name = token;
      }
    } else {
      this.pos += name.length;
    }

    this.skipWhitespace();
    if (this.peek() !== '{') {
      return null;
    }
    this.pos++; // skip '{'

    const node = new DtsNode(name, label);

    while (this.pos < this.len) {
      this.skipWhitespace();
      if (this.pos >= this.len) break;

      if (this.peek() === '}') {
        this.pos++; // skip '}'
        this.skipWhitespace();
        if (this.peek() === ';') this.pos++; // skip ';'
        break;
      }

      // Comments inside node
      if (this.peek() === '/' && (this.peek(1) === '*' || this.peek(1) === '/')) {
        const comment = this.parseComment();
        node.leadingComments.push(comment);
        continue;
      }

      // Check if child node: starts with identifier followed by optional ':' and '{'
      const savedPos = this.pos;
      const child = this.tryParseChildNode();
      if (child) {
        node.addChild(child);
        continue;
      }
      this.pos = savedPos;

      // Otherwise parse property
      const prop = this.parseProperty();
      if (prop) {
        node.properties.push(prop);
      } else {
        this.pos++;
      }
    }

    return node;
  }

  tryParseChildNode() {
    this.skipWhitespace();
    const token = this.readIdentifierOrRef();
    if (!token) return null;

    this.skipWhitespace();
    let label = null;
    let name = token;

    if (this.peek() === ':') {
      label = token;
      this.pos++; // skip ':'
      this.skipWhitespace();
      name = this.readIdentifierOrRef() || label;
    }

    this.skipWhitespace();
    if (this.peek() === '{') {
      this.pos++; // skip '{'
      const child = new DtsNode(name, label);

      while (this.pos < this.len) {
        this.skipWhitespace();
        if (this.pos >= this.len) break;

        if (this.peek() === '}') {
          this.pos++;
          this.skipWhitespace();
          if (this.peek() === ';') this.pos++;
          break;
        }

        if (this.peek() === '/' && (this.peek(1) === '*' || this.peek(1) === '/')) {
          child.leadingComments.push(this.parseComment());
          continue;
        }

        const saved = this.pos;
        const grandChild = this.tryParseChildNode();
        if (grandChild) {
          child.addChild(grandChild);
          continue;
        }
        this.pos = saved;

        const prop = this.parseProperty();
        if (prop) {
          child.properties.push(prop);
        } else {
          this.pos++;
        }
      }

      return child;
    }

    return null;
  }

  parseProperty() {
    this.skipWhitespace();
    const name = this.readPropertyName();
    if (!name) return null;

    this.skipWhitespace();
    if (this.peek() === ';') {
      this.pos++;
      return new DtsProperty(name, true, `${name};`);
    }

    if (this.peek() === '=') {
      this.pos++; // skip '='
      this.skipWhitespace();
      const start = this.pos;
      while (this.pos < this.len && this.input[this.pos] !== ';') {
        // Handle strings with quotes
        if (this.input[this.pos] === '"') {
          this.pos++;
          while (this.pos < this.len && this.input[this.pos] !== '"') {
            if (this.input[this.pos] === '\\') this.pos++;
            this.pos++;
          }
        }
        this.pos++;
      }
      const rawValue = this.input.slice(start, this.pos).trim();
      if (this.peek() === ';') this.pos++;

      let parsedValue = rawValue;
      if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        parsedValue = rawValue.slice(1, -1);
      } else if (rawValue.startsWith('<') && rawValue.endsWith('>')) {
        parsedValue = rawValue.slice(1, -1).trim();
      }

      return new DtsProperty(name, parsedValue, rawValue);
    }

    return null;
  }

  readIdentifierOrRef() {
    this.skipWhitespace();
    const start = this.pos;
    if (this.peek() === '&' || this.peek() === '/') {
      this.pos++;
    }
    while (this.pos < this.len && /[a-zA-Z0-9_-]/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }

  readPropertyName() {
    this.skipWhitespace();
    const start = this.pos;
    if (this.peek() === '#') this.pos++;
    while (this.pos < this.len && /[a-zA-Z0-9_,#-]/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }
}

function parseDts(input) {
  const parser = new DtsParser(input);
  return parser.parse();
}

module.exports = {
  DtsParser,
  parseDts
};

