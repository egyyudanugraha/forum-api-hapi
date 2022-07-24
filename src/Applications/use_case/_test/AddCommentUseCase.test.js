const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');

describe('AddCommentUseCase', () => {
  it('should throw error if use case not contain param thread id', () => {
    // Arrange
    const useCasePayload = {};
    const addCommentUseCase = new AddCommentUseCase({});

    // Action & Assert
    expect(() => addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if use case not param thread id not string', () => {
    // Arrange
    const useCasePayload = {
      threadId: 1,
    };
    const addCommentUseCase = new AddCommentUseCase({});

    // Action & Assert
    expect(() => addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if use case thread id not found', () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(() => addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-222', username: 'testaddcomment' });
    await ThreadTableTestHelper.addThread({ id: 'thread-123-xx', title: 'thread title', owner: 'user-222' });
    const useCasePayload = {
      threadId: 'thread-123-xx',
      content: 'some content',
    };
    const useCasePayloadComment = new AddComment({
      content: 'comment content',
    });
    const expecttedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayloadComment.content,
      owner: 'user-222',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expecttedComment));
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123-xx' }));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const response = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(response).toStrictEqual(expecttedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload);
  });
});
