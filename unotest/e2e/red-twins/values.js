// Red twins (#449) of the number readers' options: each option changes
// the value, so the twin compares the call's result with what it would be
// without the option and must fail with the option's own output in the
// message; the same call compared with that output passes next to it.

function test_format_number_twins() {
  step("locale: German grouping fails the English text, passes its own", () => {
    assert_failed_with(caught_message(() => assertEqual(formatNumber(1234.5, {locale: 'de-DE'}), '1,234.5')), '"1.234,5"');
    assertEqual(formatNumber(1234.5, {locale: 'de-DE'}), '1.234,5');
  });

  step("maxFractionDigits: the rounded value fails the full one, passes its own", () => {
    assert_failed_with(caught_message(() => assertEqual(formatNumber(1234.5678, {locale: 'en-US', maxFractionDigits: 1}), '1,234.568')), '"1,234.6"');
    assertEqual(formatNumber(1234.5678, {locale: 'en-US', maxFractionDigits: 1}), '1,234.6');
  });

  step("minFractionDigits: the padded value fails the bare one, passes its own", () => {
    assert_failed_with(caught_message(() => assertEqual(formatNumber(7, {locale: 'en-US', minFractionDigits: 2}), '7')), '"7.00"');
    assertEqual(formatNumber(7, {locale: 'en-US', minFractionDigits: 2}), '7.00');
  });
}

function test_to_number_twins() {
  step("decimal: a comma mark reads 1,234 as a fraction, a dot mark as thousands", () => {
    assert_failed_with(caught_message(() => assertEqual(toNumber('1,234', {decimal: ','}), 1234)), 'got 1.234');
    assertEqual(toNumber('1,234', {decimal: ','}), 1.234);
    assertEqual(toNumber('1,234', {decimal: '.'}), 1234);
  });
}
