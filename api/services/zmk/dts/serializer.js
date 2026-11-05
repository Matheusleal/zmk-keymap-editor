function serializeProperty(prop, indent = '        ') {
  if (prop.value === true) {
    return `${indent}${prop.name};`;
  }
  if (typeof prop.value === 'string') {
    const val = prop.raw !== null ? prop.raw : `"${prop.value}"`;
    return `${indent}${prop.name} = ${val};`;
  }
  return `${indent}${prop.name} = <${prop.value}>;`;
}

function serializeNode(node, depth = 1) {
  const indent = '    '.repeat(depth);
  const childIndent = '    '.repeat(depth + 1);
  const lines = [];

  // Comments attached to node
  for (const c of node.leadingComments) {
    lines.push(`${indent}${c.raw}`);
  }

  // Header line: label: name { or name {
  const header = node.label ? `${node.label}: ${node.name}` : node.name;
  lines.push(`${indent}${header} {`);

  // Properties
  for (const prop of node.properties) {
    for (const c of prop.leadingComments || []) {
      lines.push(`${childIndent}${c.raw}`);
    }
    lines.push(serializeProperty(prop, childIndent));
  }

  // Children
  for (const child of node.children) {
    lines.push(serializeNode(child, depth + 1));
  }

  lines.push(`${indent}};`);
  return lines.join('\n');
}

function serializeDts(doc) {
  const lines = [];

  for (const stmt of doc.statements) {
    if (stmt.type === 'directive') {
      lines.push(stmt.raw);
    } else if (stmt.type === 'comment') {
      lines.push(stmt.raw);
    } else if (stmt.type === 'node') {
      if (stmt.name === '/') {
        // Root node
        lines.push('/ {');
        for (const prop of stmt.properties) {
          lines.push(serializeProperty(prop, '    '));
        }
        for (const child of stmt.children) {
          lines.push(serializeNode(child, 1));
        }
        lines.push('};');
      } else {
        lines.push(serializeNode(stmt, 0));
      }
    }
  }

  return lines.join('\n\n') + '\n';
}

module.exports = {
  serializeDts,
  serializeNode,
  serializeProperty
};
