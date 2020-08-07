/**
* The trie's node
*
* @constructor
* @param {String} word this part of path.
* @param {Boolean} [isWild = false] if is wild, eg. app/user/{id}.
*/
function Node(word, isWild = false) {
  this.word = word;
  this.isWild = isWild;
  this.children = [];
  this.father = null;
  this.canEnd = false;
  this.callback = null;
}

/**
* to judge is two node equal
*
* @param {Node} node
*/
Node.prototype.equals = function(node) {
  return (
    this.word === node.word &&
    this.isWild === node.isWild
  );
};

/**
* to judge if a word match this node.
*
* @param {String} word
*/
Node.prototype.match = function(word) {
  if (this.word === '*') return true;
  if (this.isWild) return true;
  if (this.word === word) return true;
  return false;
};

/**
* generate the path of this url.
*
*/
Node.prototype.getUrl = function() {
  const getPart =  ({ word, isWild }) => isWild ? `{${word}}` : word;
  let url = this.isWild ? getPart(this) : this.word;
  let node = this.father;
  while (node) {
    url = `${getPart(node)}/${url}`;
    node = node.father;
  }
  return url;
};

/**
* log this node and its children for debug.
*
* @param {Number} [depth = 0] the depth of dfs.
*/
Node.prototype.debug = function(depth = 0) {
  const part = `${this.isWild ? '\{' : ''}${this.word}${this.isWild ? '\}' : ''}`;
  if (depth === 0) {
    console.log(` ┌  ${part}`);
  } else {
    const blank = [...new Array(depth)].map(() => ' │ ').join('').slice(0, -2) + '├─ ';
    console.log(blank + part);
  }
  for (let i = 0; i < this.children.length; i++) {
    this.children[i].debug(depth + 1);
  }
};

module.exports = Node;