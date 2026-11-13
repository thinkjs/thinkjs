export async function contract(fetcher) {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  let response = await fetcher(new Request('https://example.com/'));
  check(response.status === 200, 'index status');
  check((await response.json()).data.runtime === 'fetch', 'index body');
  response = await fetcher(
    new Request('https://example.com/index/echo?name=ok&a=1&a=2', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({value: 42})
    })
  );
  const data = (await response.json()).data;
  check(
    data.post.value === 42 && data.query.a.length === 2,
    'payload and repeated query'
  );
  response = await fetcher(new Request('https://example.com/index/echo'));
  check((await response.json()).errno === 1001, 'validation');
  response = await fetcher(new Request('https://example.com/index/stream'));
  check((await response.text()) === 'hello edge', 'stream');
  response = await fetcher(
    new Request('https://example.com/', {method: 'HEAD'})
  );
  check((await response.text()) === '', 'HEAD');
  const form = new FormData();
  form.set('file', new File(['hello'], 'sample.txt'));
  response = await fetcher(
    new Request('https://example.com/index/upload', {
      method: 'POST',
      body: form
    })
  );
  check((await response.json()).data.size === 5, 'upload');
}
