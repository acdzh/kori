var Node = require('./node');

/**
* The trie to store path
*
* @constructor
*/
function Trie() {
  this.root = new Node('', false);
}

/**
* debug.
*/
Trie.prototype.debug = function() {
  this.root.debug();
};

/**
* add a path to this trie.
*
* @param {String} path if it doesn't start with '/', it will be added a '/'.
* @param {Function} callback callback function.
*/
Trie.prototype.addRouter = function(path, callback) {
  if (path[0] === '/') {
    path = path.slice(1);
  };
  const parts = path.split('/');
  const partsLength = parts.length;

  let currentNode = this.root;

  for (let i = 0; i < parts.length; i++) {
    let word = parts[i];
    let isEnd = i === partsLength - 1 || word === '*';
    let length = word.length;
    let isWild = false;
    
    if (length > 1 && word[0] === '{' && word[length - 1] === '}') {
      isWild = true;
      word = word.slice(1, length - 1);
    }
    let tempNode = new Node(word, isWild);

    const foundNode = currentNode.children.find(node => node.equals(tempNode));

    if (foundNode) {
      if (isEnd) {
        foundNode.callback = callback;
        foundNode.canEnd = true;
      } else {
        currentNode = foundNode;
      }
    } else {
      if (isEnd) {
        tempNode.callback = callback;
        tempNode.canEnd = true;
      }
      currentNode.children.push(tempNode);
      tempNode.father = currentNode;
      currentNode = tempNode;
    }

    if (isEnd) break;
  }
  return this;

};

/**
* get a path from this trie.
*
* @param {String} path if it doesn't start with '/', it will be added a '/'.
*/
Trie.prototype.getRouter = function(path) {
  if (path[0] === '/') {
    path = path.slice(1);
  };
  const parts = path.split('/');
  const partsLength = parts.length;
  let haveMatched = false;

  let currentNode = this.root;

  const nullResult = {
    node: null,
    keys: {},
    splat: null
  };

  const keys = {};

  for (let i = 0; i < parts.length; i++) {
    let word = parts[i];
    const matchNode = currentNode.children.find(node => node.word !== '*' && node.match(word));

    if (matchNode) {
      haveMatched = true;
      if (matchNode.isWild) {
        keys[matchNode.word] = word;
      }
      currentNode = matchNode;
    } else {
      const starNode = currentNode.children.find(node => node.word === '*');
      if (starNode) {
        return {
          node: starNode,
          keys,
          splat: parts.slice(i).join('/'),
        };
      }
      // looc back for '*'
      for (let j = i - 1; j >= 0; j--) {
        currentNode = currentNode.father;
        const starNode = currentNode.children.find(node => node.word === '*');
        if (starNode) {
          return {
            node: starNode,
            keys,
            splat: parts.slice(j).join('/'),
          };
        }
      }
      return nullResult;
    }
  }
  return haveMatched && currentNode.canEnd ? {
    node: currentNode,
    keys,
    splat: null
  } : nullResult;
}

module.exports = Trie;
