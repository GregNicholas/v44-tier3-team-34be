import { Profile } from "../models/profile.js";
import { Post } from "../models/post.js";

const create = async (req, res) => {
  try {
    req.body.author = req.user.Profile;
    const post = await Post.create(req.body);
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { posts: post } },
      { new: true }
    );
    post.author = profile;
    res.status(201).json(post);
  } catch (error) {
    console.error("An error occured", error);
    res.status(500).json(error);
  }
};

const index = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
};

const show = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author")
      .populate("comments.author");
    res.status(200).json(post);
  } catch (error) {
    res.status(500).error;
  }
};

const update = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("author");
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    const profile = await Profile.findById(req.user.profile);
    profile.posts.remove({ _id: req.params.id });
    await profile.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

const createComment = async (req, res) => {
  try {
    req.body.author = req.user.profile;
    const post = await Post.findById(req.params.id);
    post.comments.push(req.body);
    await post.save();

    const newComment = post.comments[post.comments.length - 1];
    const profile = await Profile.findById(req.user.profile);
    newComment.author = profile;
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json(error);
  }
};


export {
  create,
  index,
  show,
  update,
  deletePost as delete,
  createComment,
};