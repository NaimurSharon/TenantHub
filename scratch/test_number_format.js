function formatNumberWithOptions(amount, formatOpts = {}) {
  const decimalPlaces = formatOpts.decimal_places ?? 2;
  const primaryGroup = formatOpts.primary_group_size ?? 3;
  const secondaryGroup = formatOpts.secondary_group_size ?? 3;
  const thousandSep = formatOpts.thousand_separator ?? ",";
  const decimalSep = formatOpts.decimal_separator ?? ".";

  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  // 1. Format decimal portion
  const fixedStr = absVal.toFixed(decimalPlaces);
  const [intPart, decPart] = fixedStr.split(".");

  // 2. Format integer grouping (primary & secondary group sizes)
  let formattedInt = "";
  if (intPart.length <= primaryGroup) {
    formattedInt = intPart;
  } else {
    const primaryChunk = intPart.slice(-primaryGroup);
    let remaining = intPart.slice(0, -primaryGroup);
    const chunks = [];

    const secSize = secondaryGroup > 0 ? secondaryGroup : primaryGroup;
    while (remaining.length > 0) {
      if (remaining.length <= secSize) {
        chunks.unshift(remaining);
        break;
      }
      chunks.unshift(remaining.slice(-secSize));
      remaining = remaining.slice(0, -secSize);
    }

    formattedInt = chunks.join(thousandSep) + thousandSep + primaryChunk;
  }

  // 3. Combine integer and decimal parts
  const numberStr = decPart !== undefined && decimalPlaces > 0
    ? `${formattedInt}${decimalSep}${decPart}`
    : formattedInt;

  return { isNegative, numberStr };
}

// Test with admin screenshot parameters:
// Sample Amount: 1000000, Decimal Places: 1, Primary: 3, Secondary: 2, Decimal Sep: '.', Thousand Sep: ','
const opts = {
  decimal_places: 1,
  primary_group_size: 3,
  secondary_group_size: 2,
  thousand_separator: ",",
  decimal_separator: "."
};

const res = formatNumberWithOptions(1000000, opts);
console.log("Formatted Number:", res.numberStr);
console.log("Full Preview: ৳", res.numberStr);
