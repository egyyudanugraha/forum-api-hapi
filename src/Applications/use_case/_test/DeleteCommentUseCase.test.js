const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');

describe('DeleteCommentUseCase', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  it('should throw error if use case params not contain comment id', async () => {
    // Arrange
    const useCaseParams = {};

    // Action & Assert
    await expect(new DeleteCommentUseCase({}).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
  });

  it('should throw error if comment id not string', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 123,
    };

    // Action & Assert
    await expect(new DeleteCommentUseCase({}).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if comment not found', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 'commentId',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    // Action & Assert
    await expect(new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
  });

  it('should throw error if comment not owner of comment', async () => {
    await UsersTableTestHelper.addUser({ username: 'usernamecommentdel', id: 'commentdel' });
    await ThreadTableTestHelper.addThread({ id: 'threaddel', owner: 'commentdel' });
    await CommentTableTestHelper.addComment({ id: 'commentdel', userId: 'commentdel', threadId: 'threaddel' });
    // Arrange
    const useCaseParams = {
      commentId: 'commentdel',
      owner: 'user-12333',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ owner: 'commentdel' }));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    const result = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCaseParams);

    // Assert
    expect(result).rejects.toThrowError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_OWNER');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ username: 'exampleusernamedel', id: 'commentdel2' });
    await ThreadTableTestHelper.addThread({ id: 'threaddel2-xx-x', owner: 'commentdel2' });
    await CommentTableTestHelper.addComment({ id: 'commentdel2', userId: 'commentdel2', threadId: 'threaddel2-xx-x' });
    const useCaseParams = {
      commentId: 'commentdel2',
      owner: 'commentdel2',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'commentdel2', owner: 'commentdel2' }));
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCaseParams);

    // Assert
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith('commentdel2');
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith('commentdel2');
  });
});
