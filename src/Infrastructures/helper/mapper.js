const mapThreadComments = (thread, comments) => {
  const mappedComments = comments.map((comment) => ({
    ...comment,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const result = {
    ...thread,
    comments: mappedComments,
  };

  return !thread ? null : result;
};

module.exports = {
  mapThreadComments,
};
