function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generates a human-friendly, unique order number e.g. ORD-20260913-4821
function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}

// Basic Algerian mobile phone validation: 05/06/07 + 8 digits (10 digits total),
// optionally prefixed with +213 or 0.
function isValidAlgerianPhone(phone) {
  const cleaned = phone.replace(/\s|-/g, '');
  return /^(?:\+213|0)(5|6|7)[0-9]{8}$/.test(cleaned);
}

function toNumber(decimal) {
  return decimal === null || decimal === undefined ? decimal : Number(decimal);
}

module.exports = { slugify, generateOrderNumber, isValidAlgerianPhone, toNumber };
