module.exports = () => {
  throw new Error(
    'Node startup is unavailable in a Fetch bundle; set runtime: edge'
  );
};
