class DtsNode {
  constructor(name, label = null) {
    this.type = 'node';
    this.name = name;
    this.label = label;
    this.properties = [];
    this.children = [];
    this.leadingComments = [];
    this.trailingComment = null;
  }

  getProperty(name) {
    return this.properties.find(p => p.name === name);
  }

  setProperty(name, value, raw = null) {
    const existing = this.getProperty(name);
    if (existing) {
      existing.value = value;
      if (raw !== null) existing.raw = raw;
    } else {
      this.properties.push(new DtsProperty(name, value, raw));
    }
  }

  getChild(name) {
    return this.children.find(c => c.name === name || c.label === name);
  }

  addChild(node) {
    this.children.push(node);
  }
}

class DtsProperty {
  constructor(name, value = null, raw = null) {
    this.type = 'property';
    this.name = name;
    this.value = value;
    this.raw = raw;
    this.leadingComments = [];
  }
}

class DtsDirective {
  constructor(raw) {
    this.type = 'directive';
    this.raw = raw;
  }
}

class DtsComment {
  constructor(raw, isBlock = false) {
    this.type = 'comment';
    this.raw = raw;
    this.isBlock = isBlock;
  }
}

class DtsDocument {
  constructor() {
    this.type = 'document';
    this.statements = [];
    this.rootNode = null;
  }

  findNode(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.rootNode;
    for (const part of parts) {
      if (!current) return null;
      current = current.getChild(part);
    }
    return current;
  }
}

module.exports = {
  DtsNode,
  DtsProperty,
  DtsDirective,
  DtsComment,
  DtsDocument
};

