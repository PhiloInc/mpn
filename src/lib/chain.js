export default function create(chain) {
  return async (...rest) => {
    for (const part of chain) {
      const response = await part(...rest);
      if (response !== null) {
        return response;
      }
    }
    return null;
  };
}
