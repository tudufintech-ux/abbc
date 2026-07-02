export async function createCieloPayment() {
  // Cielo disabled in this phase.
  // Credit card payments will be implemented later using a secure hosted checkout or PCI-compliant flow.

  return {
    success: false,
    message: "Credit card payments are disabled in this phase.",
  };
}
