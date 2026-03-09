# QoreID NIN Verification POC (Next.js)

This is a standalone Proof of Concept for verifying Nigerian NINs using the QoreID API.

## Setup

1. **Environment Variables**:
   Create a `.env.local` file in the root of this project (or add to your existing one) with:
   ```env
   QOREID_TEST_KEY=your_actual_test_api_key
   ```

2. **Files**:
   - `app/api/verify-nin/route.ts`: Handlers the secure server-side call to QoreID.
   - `app/page.tsx`: A clean, modern UI to test the verification.

## How it Works

1. **Encryption & Security**: The API key is kept on the server (`process.env`). It is never exposed to the browser.
2. **Input**: Accepts an 11-digit NIN, First Name, and Last Name.
3. **API Call**: Uses `fetch` to POST to `https://api.qoreid.com/v1/ng/identities/nin/{nin}`.
4. **Matching Logic**:
   - We send the `firstname` and `lastname` in the request body.
   - QoreID compares these against the records at NIMC.
   - We only return `success: true` if `summary.nin_check.status === "EXACT_MATCH"`.
5. **Output**: Returns the verified names or a descriptive error message.

## Testing

1. Ensure your Dev Server is running.
2. Navigate to the page where you've placed the `NINVerificationPage` component.
3. Enter a valid Nigerian NIN (Test NINs can be found in QoreID Sandbox docs).
4. See the result instantly.

## Example Frontend Call (Code Snippet)

```javascript
const verifyNIN = async (nin, firstname, lastname) => {
  const response = await fetch("/api/verify-nin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nin, firstname, lastname }),
  });
  
  const data = await response.json();
  if (data.success) {
    console.log("Verified:", data.firstname, data.lastname);
  } else {
    console.error("Error:", data.message);
  }
};
```
