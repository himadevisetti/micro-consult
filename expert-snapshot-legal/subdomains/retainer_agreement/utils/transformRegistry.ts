export function applyTransform(name: string, value: string): string {
  switch (name) {
    case 'titleCase':
      return value.replace(/\b\w/g, char => char.toUpperCase());

    case 'formatDate':
      return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

    case 'formatCurrency':
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(num)
        ? value
        : new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(num);

    case 'sentenceCase':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    case 'upperCase':
      return value.toUpperCase();

    default:
      return value;
  }
}

