function extractArgs (args) {
  let prefix = null;
  let literal = null;
  if (args.length === 1) {
    prefix = '';
    literal = args[0];
  } else if (args.length === 2) {
    prefix = `${args[0]} `;
    literal = args[1];
  }
  return [ prefix, literal ];
}

export default function classAttrib (...args) {
  const [ prefix, literal ] = extractArgs(args);
  return prefix + Object.keys(literal).reduce((acc, key) => {
    if (literal[key]) { acc.push(key) }
    return acc;
  }, []).join(' ');
}
