const yup = require('yup')
const roleEnum = ['AUTHOR', 'READER', 'ADMIN']
const categoryEnum = ['TECHNOLOGY', 'LIFESTYLE', 'EDUCATION']


const signupSchema = yup.object({
    input: yup.object({
    name: yup.string().trim().min(2).max(60).required(),
    email: yup.string().trim().email().required(),
    role: yup.mixed().oneOf(["AUTHOR", "READER", "ADMIN"]).required(),
    password: yup.string().min(6).max(128).required(),
  }).required(),
});

const loginSchema = yup.object({
  input: yup.object({
    email: yup.string().trim().email().required(),
    password: yup.string().min(6).max(128).required(),
  }).required(),
});

const createUserSchema = yup.object({
    input: yup.object({
        name: yup.string().trim().min(2).max(60).required(),
        email: yup.string().trim().email().required(),
        role: yup.mixed().oneOf(roleEnum).required()
    }).required(),
})

const createPostSchema = yup.object({
    input: yup.object({
        title: yup.string().trim().min(3).max(120).required(),
        body: yup.string().trim().min(10).required(),
        authorId: yup.string().required(),
        category: yup.mixed().oneOf(categoryEnum).required()
    }).required()
})

const createCommentSchema =yup.object({
    input: yup.object({
        text: yup.string().trim().min(1).max(500).required(),
        authorId: yup.string().required(),
        postId: yup.string().required(),
    }).required()
})

async function validate(schema, value) {
    try{
        await schema.validate(value, { abortEarly: false, stripUnknown: true})
    }catch(e){
    // Convert YupError to array of { path, message }
 const details = (e.inner || []).map(err => ({
      path: err.path,
      message: err.message,
    }));

    e.details = details.length
      ? details
      : [{ path: e.path, message: e.message }];

    throw e;
  }
}

module.exports = {
  createUserSchema,
  createPostSchema,
  createCommentSchema,
  validate,
};

module.exports.signupSchema = signupSchema;
module.exports.loginSchema = loginSchema;