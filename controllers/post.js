const Post = require('../models/post');
const User = require('../models/user');
const { clearImage } = require('../helpers/clear-image');

exports.getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const postsPerPage = 2;

  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find({}).populate('creator').skip((currentPage - 1) * postsPerPage).limit(postsPerPage);

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts,
      totalItems,
    });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post doesn't exists.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched successfully',
      post,
    });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addPost = async (req, res, next) => {
  const { title, content } = req.body;
  const imageUrl = req.file.path.replace(/\\/g, '/');
  const { userId } = req;

  const postData = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });

  try {
    const post = await postData.save();
    const user = await User.findById(userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
      message: 'Post created successfully',
      post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  const { title, content } = req.body;
  const { postId } = req.params;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace(/\\/g, '/');
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post doesn't exists.");
      error.statusCode = 404;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const updatedPost = await post.save();
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post doesn't exists.");
      error.statusCode = 404;
      throw error;
    }
    const { imageUrl } = post;
    await Post.findByIdAndDelete(postId);
    clearImage(imageUrl);
    const user = await User.findById(userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: 'Post deleted!' });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
