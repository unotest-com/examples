// Value helpers that take a DSL object — the receiving half of
// misc/strings-indexes-objects: an object literal built in a scenario
// arrives here intact, and is read through a chain with an index in it.
function describe_user(user) {
  return textJoin([user.name, ' <', user.contact.emails[0], '>']);
}

// The receiving half of misc/unary-not-array-append: an array handed in is
// the caller's own, so the push reaches it; rebinding the parameter does
// not, which the returned length (0) shows.
function append_twice(list, value) {
  list.push(value, value);
  list = [];
  return list.length;
}
