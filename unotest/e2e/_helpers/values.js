// Value helpers that take a DSL object — the receiving half of
// misc/strings-indexes-objects: an object literal built in a scenario
// arrives here intact, and is read through a chain with an index in it.
function describe_user(user) {
  return textJoin([user.name, ' <', user.contact.emails[0], '>']);
}
