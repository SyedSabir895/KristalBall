function resolveBaseId(req, requestedBaseId) {
  if (req.user.role === 'BASE_COMMANDER') {
    return req.user.base_id;
  }
  return requestedBaseId ? Number(requestedBaseId) : null;
}

module.exports = { resolveBaseId };
