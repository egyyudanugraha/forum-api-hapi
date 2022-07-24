const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const threadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');

describe('AddReplyUseCase', () => {
  it('should throw error if use case not contain param thread id', () => {
    const useCase = new AddReplyUseCase({
      replyRepository: new ReplyRepository(),
      commentRepository: new CommentRepository(),
      threadRepository: new threadRepository(),
    });

    expect(() => useCase.execute({
      content: 'content',
      commentId: 'commentId',
      owner: 'owner',
    })).toThrow('ADD_REPLY_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });
  it('should throw error if use case not contain param comment id', () => {
    // Arrange
    const useCasePayload = {};
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.NOT_CONTAIN_COMMENT_ID');
  });

  it('should throw error if use case not param comment id not string', () => {
    // Arrange
    const useCasePayload = {
      commentId: 1,
    };
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if use case comment id not found', () => {
    // Arrange
    const useCasePayload = {
      commentId: 'commentId',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-2228888', username: 'testaddreply' });
    await ThreadTableTestHelper.addThread({ id: 'thread-123-xxs', title: 'thread title', owner: 'user-22288' });
    await CommentTableTestHelper.addComment({
      id: 'comment-123-xxx', threadId: 'thread-123-xxs', content: 'comment content', userId: 'user-22288',
    });
    const useCasePayload = {
      commentId: 'comment-123-xxx',
      content: 'reply content',
    };
    const useCasePayloadReply = new AddReply({
      content: 'reply content',
    });
    const expecttedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayloadReply.content,
      owner: 'user-2228888',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expecttedReply));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123-xxx' }));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const reply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(reply).toEqual(expecttedReply);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(useCasePayloadReply);
  });
});
