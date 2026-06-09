/**
 * Generate a unique order number in format: CLS-XXXXXXXX
 * Uses timestamp (6 digits) + random (3 digits) for uniqueness.
 */
function generateOrderNumber() {
  const now = new Date();
  const timestamp = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `CLS-${timestamp.slice(-6)}${random}`;
}

module.exports = { generateOrderNumber };
