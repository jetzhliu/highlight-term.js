var chalk = require('chalk');
var hljs = require('highlight.js');

function id(str) {
	return str;
}

function getStyle(type) {
	switch (type) {
		case 'hljs':
			return chalk.black;
		case 'hljs-tag':
		case 'hljs-tag':
		case 'hljs-subst':
			return chalk.white;
		case 'hljs-strong':
		case 'hljs-emphasis':
			return chalk.gray;
		case 'hljs-bullet':
		case 'hljs-quote':
		case 'hljs-number':
		case 'hljs-regexp':
		case 'hljs-literal':
		case 'hljs-link':
			return chalk.magenta;
		case 'hljs-code':
		case 'hljs-title':
		case 'hljs-section':
		case 'hljs-selector-class':
			return chalk.green;
		case 'hljs-strong':
			return chalk.bold;
		case 'hljs-emphasis':
			return chalk.italic;
		case 'hljs-keyword':
		case 'hljs-selector-tag':
		case 'hljs-name':
		case 'hljs-attr':
			return chalk.red;
		case 'hljs-symbol':
		case 'hljs-attribute':
		case 'hljs-params':
			return chalk.cyan;
		case 'hljs-string':
		case 'hljs-type':
		case 'hljs-built_in':
		case 'hljs-builtin-name':
		case 'hljs-selector-id':
		case 'hljs-selector-attr':
		case 'hljs-selector-pseudo':
		case 'hljs-addition':
		case 'hljs-variable':
		case 'hljs-template-variable':
			return chalk.yellow;
		case 'hljs-comment':
		case 'hljs-deletion':
		case 'hljs-meta':
			return chalk.gray
		default:
			return id;
	}
}


function unescape(value) {
	return value.replace(/&amp;/gm, '&').replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
}


// raw: function testErr1() {
// hljs output: <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">testErr1</span>(<span class="hljs-params"></span>) </span>{
// expect: 
// {
// 	style: 'hljs',
// 	children: [
// 		{
// 			style: 'hljs-function',
// 			children: [
// 				{
// 					style: 'hljs-keyword',
// 					children: ['function'],
// 				},
// 				' ',
// 				{
// 					style: 'hljs-title',
// 					children: ['testErr1'],
// 				},
// 				'(',
// 				{
// 					style: 'hljs-params',
// 					children: [''],
// 				},
// 				') '
// 			]
// 		},
// 		'{'
// 	]
// }
function code2obj(str) {
	var cur = [];
	var paths = [{
		style: 'hljs',
		children: cur
	}, cur];
	var todo = str;
	var m;
	while (todo && (m = todo.match(/<\/?span.*?>/))) {
		if (m.index) {
			cur.push(unescape(todo.slice(0, m.index)));
		}
		if (m[0] === '</span>') {
			paths.pop();
			cur = paths[paths.length-1];
		} else {
			var newCur = [];
			cur.push({
				style: m[0].match(/"([-\w ]+)"/)[1],
				children: newCur
			});
			paths.push(cur = newCur);
		}
		todo = todo.slice(m.index + m[0].length);
	}
	if (todo) {
		cur.push(todo);
	}
	return paths[0];
}

function obj2str(obj) {
	if (typeof obj === 'string') {
		return obj;
	}
	var style = getStyle(obj.style);
	return style(obj.children.map(obj2str).join(''));
}

function trans(src) {
	return obj2str(code2obj(src));
}
function adjust(obj) {
	if (obj && obj.value) {
		obj.value = trans(obj.value);
	}
	return obj;
}
function highlight(name, value) {
	if (!chalk.supportsColor) {
		return {
			value: value
		};
	}
	return adjust(hljs.highlight(name, value));
}
function highlightAuto(text, languageSubset) {
	if (!chalk.supportsColor) {
		return {
			value: value
		};
	}
	var ret = adjust(hljs.highlightAuto(text, languageSubset));
	adjust(ret.second_best);
	return ret;
}

module.exports = Object.assign({}, hljs, chalk, {
	highlight: highlight,
	highlightAuto: highlightAuto,
});
