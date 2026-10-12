// env(name): a value the run has is a string, a name nobody set is null —
// a test decides on it instead of failing on a missing variable.
// env(name, fallback): the same read with a default in one line.

function test_env_reads_what_is_set_and_null_otherwise() {
  step("A value from unotest/.env comes back as a string", () => {
    base = env('APP_BASE_URL');
    assertTrue(base != null, 'APP_BASE_URL is set for the dogfood suite');
    assertTrue(textContains(base, 'playground.unotest.com'), 'base: ' + base);
  });

  step("A name nobody set is null, and the test takes the other branch", () => {
    live = env('UNOTEST_DOGFOOD_NEVER_SET');
    assertTrue(live == null, 'expected null, got ' + live);
    if (live == null) {
      goto('/');
    } else {
      goto(live);
    }
    waitForText('Stress-test browser');
  });

  step("A fallback stands in for a name nobody set, never for one that is set", () => {
    dflt = env('UNOTEST_DOGFOOD_NEVER_SET', 'https://fallback.invalid');
    assertTrue(dflt === 'https://fallback.invalid', 'expected the fallback, got ' + dflt);
    base = env('APP_BASE_URL', 'https://fallback.invalid');
    assertTrue(textContains(base, 'playground.unotest.com'), 'a set value wins over the fallback, got ' + base);
  });
}
