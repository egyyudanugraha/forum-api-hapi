const mapThreadComments = ({ thread, comments, replies }) => {
  const mappedReplies = (reply) => ({
    id: reply.id,
    date: reply.date,
    content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
    username: reply.username,
  });

  const sortedByDate = (a, b) => new Date(a.date) - new Date(b.date);

  const mappedComments = comments.map((comment) => ({
    id: comment.id,
    date: comment.date,
    username: comment.username,
    content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    replies: replies.filter((reply) => reply.comment_id === comment.id)
      .map(mappedReplies)
      .sort(sortedByDate),
  })).sort(sortedByDate);

  const result = {
    ...thread,
    comments: mappedComments,
  };

  return !thread ? null : result;
};

module.exports = {
  mapThreadComments,
};
