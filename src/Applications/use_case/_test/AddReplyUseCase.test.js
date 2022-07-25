const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');

describe('AddReplyUseCase', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  it('should throw error if use case not contain param thread id', () => {
    const useCasePayload = {
      content: 'content',
      commentId: 'commentId',
      owner: 'user-222',
    };

    const useCase = new AddReplyUseCase({});

    expect(() => useCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
  });

  it('should throw error if use case not contain param comment id', () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      owner: 'user-222',
      threadId: 'thread-123-xx',
    };
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
  });

  it('should throw error if use case not param thread id & comment id not string', () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      owner: 'user-222',
      threadId: 34,
      commentId: 1,
    };
    const addReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if use case thread id not found', () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      owner: 'user-222',
      threadId: 'threadId',
      commentId: 'commentId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.THREAD_NOT_FOUND');
  });

  it('should throw error if use case comment id not found', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-222881', username: 'testaddreply' });
    await ThreadTableTestHelper.addThread({ id: 'thread-123-xxl', title: 'thread title', owner: 'user-222881' });
    const useCasePayload = {
      content: 'content',
      owner: 'user-222',
      threadId: 'thread-123-xxl',
      commentId: 'commentId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123-xxl' }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    expect(() => addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-22288', username: 'testaddreplyxx' });
    await ThreadTableTestHelper.addThread({ id: 'thread-123-xxs', title: 'thread title', owner: 'user-22288' });
    await CommentTableTestHelper.addComment({
      id: 'comment-123-xxx', threadId: 'thread-123-xxs', content: 'comment content', userId: 'user-22288',
    });
    const useCasePayload = {
      commentId: 'comment-123-xxx',
      content: 'reply content',
      owner: 'user-22288',
      threadId: 'thread-123-xxs',
    };
    const useCasePayloadReply = new AddReply({
      content: 'reply content',
    });
    const expecttedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayloadReply.content,
      owner: 'user-22288',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123-xxs' }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123-xxx' }));
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expecttedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const reply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(reply).toEqual(expecttedReply);
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith({
      content: useCasePayloadReply.content,
      owner: useCasePayload.owner,
      commentId: useCasePayload.commentId,
    });
  });
});
