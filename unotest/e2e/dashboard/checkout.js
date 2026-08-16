// Cart → coupon → card → confirmation. The card number and expiry are
// reformatted as you type (masks), so what the field holds afterwards is not
// what was typed — and the coupon arrives by paste rather than keystrokes,
// which is a different event path than fill().

function test_cart_coupon_and_payment() {
  step("Sign in and open checkout", () => {
    flow_signin();
    goto('/dashboard/checkout');
    waitFor(getByRole('button', {name: 'Add Extra seat to cart'}));
  });

  step("An empty cart blocks the order", () => {
    assertVisible(getByRole('button', {name: 'Cart is empty'}));
    assertTrue(isDisabled(getByRole('button', {name: 'Cart is empty'})), 'an empty cart must block checkout');
  });

  step("Add items and bump one quantity", () => {
    click(getByRole('button', {name: 'Add Extra seat to cart'}));
    click(getByRole('button', {name: 'Add Sandbox env to cart'}));
    click(getByRole('button', {name: 'Increase Extra seat'}));
    assertText(getByRole('listitem').filter({hasText: 'Extra seat'}), '2', {exact: false});
  });

  step("A bogus coupon is rejected, the real one applies", () => {
    clipboardPaste(getByLabel('Coupon code'), 'NOPE99');
    click(getByRole('button', {name: 'Apply'}));
    assertText(getByRole('alert'), 'Invalid coupon', {exact: false});

    fill(getByLabel('Coupon code'), 'PLAYGROUND10');
    click(getByRole('button', {name: 'Apply'}));
    assertVisible(getByText('Discount'));
  });

  step("The card fields reformat what was typed", () => {
    fill(getByLabel('Name on card'), 'Dogfood Runner');
    fill(getByLabel('Card number'), '4242424242424242');
    assertValue(getByLabel('Card number'), '4242 4242 4242 4242');
    fill(getByLabel('Expiry'), '1230');
    assertValue(getByLabel('Expiry'), '12/30');
    fill(getByLabel('CVV'), '123x');
    assertValue(getByLabel('CVV'), '123');
  });

  step("Placing the order returns a confirmation id", () => {
    click(getByRole('button', {name: 'Place order'}));
    waitForText('ORD-');
  });
}
