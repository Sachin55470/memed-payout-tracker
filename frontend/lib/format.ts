export function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatViews(views: number) {
  return views.toLocaleString("en-IN");
}
