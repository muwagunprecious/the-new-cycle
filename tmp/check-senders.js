async function main() {
  const apiKey = 'TLkGPTUpDYXYHSCCsfjVVehHNqOhINliOASfUaCuLiPRRiTthREYIYvVKDFfRT';
  const baseUrl = 'https://api.ng.termii.com';
  
  try {
    const res = await fetch(`${baseUrl}/api/sender-id?api_key=${apiKey}`);
    const data = await res.json();
    console.log('--- TERMII SENDERS ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}

main();
