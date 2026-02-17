/**
 * Format a number as USD currency
 */
export function formatCurrency(value) {
    if (value == null || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculateCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0, denomX = 0, denomY = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
}

/**
 * Calculate linear trend line (returns slope and intercept)
 */
export function calculateTrendLine(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return { slope: 0, intercept: 0 };

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0, denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (x[i] - meanX) * (y[i] - meanY);
        denominator += (x[i] - meanX) ** 2;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    return { slope, intercept };
}

/**
 * Get HSL color for price on a gradient (green -> yellow -> red)
 */
export function getColorForPrice(price, min, max) {
    if (max === min) return 'hsl(120, 70%, 50%)';
    const ratio = (price - min) / (max - min);
    // 120 = green, 60 = yellow, 0 = red
    const hue = 120 - ratio * 120;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Format large numbers compactly (e.g., 150000 -> "150K")
 */
export function formatCompact(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
}
