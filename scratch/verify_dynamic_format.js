// Test verifying dynamic preference state update
const mockStore = {
  currencySymbol: "$",
  currencyFormat: {
    decimal_places: 2,
    primary_group_size: 3,
    secondary_group_size: 3,
    thousand_separator: ",",
    decimal_separator: ".",
    negative_format: "Parentheses",
  }
};

function formatCurrencyTest(amount, customSymbol = null) {
  const symbol = customSymbol || mockStore.currencySymbol || "$";
  const formatOpts = mockStore.currencyFormat || {};

  const decimalPlaces = formatOpts.decimal_places ?? 2;
  const primaryGroup = formatOpts.primary_group_size ?? 3;
  const secondaryGroup = formatOpts.secondary_group_size ?? 3;
  const thousandSep = formatOpts.thousand_separator ?? ",";
  const decimalSep = formatOpts.decimal_separator ?? ".";
  const negativeFormat = formatOpts.negative_format ?? "Parentheses";

  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const fixedStr = absVal.toFixed(decimalPlaces);
  const [intPart, decPart] = fixedStr.split(".");

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

  const numberStr = decPart !== undefined && decimalPlaces > 0
    ? `${formattedInt}${decimalSep}${decPart}`
    : formattedInt;

  if (isNegative) {
    return negativeFormat === "Parentheses" ? `${symbol} (${numberStr})` : `${symbol} -${numberStr}`;
  }

  return `${symbol} ${numberStr}`;
}

console.log("=== DYNAMIC PREFERENCE UPDATE VERIFICATION ===");
console.log("1. Default Western Format ($ / 2 Decimals / 3 Grouping):");
console.log("   Amount 1000000 =>", formatCurrencyTest(1000000));

console.log("\n2. Admin Updates Settings in Web Panel (Symbol: ৳, Decimals: 1, Primary: 3, Secondary: 2):");
// Simulate admin preference sync from GET /setting/currencies
mockStore.currencySymbol = "৳";
mockStore.currencyFormat = {
  decimal_places: 1,
  primary_group_size: 3,
  secondary_group_size: 2,
  thousand_separator: ",",
  decimal_separator: ".",
  negative_format: "Parentheses",
};

console.log("   Updated Amount 1000000 =>", formatCurrencyTest(1000000));
