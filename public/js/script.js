$("#contact-form").validate({
  rules: {
    name: {
      required: true,
      minlength: 2,
      maxlength: 70
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minlength: 8,
      maxlength: 18
    }
  }
});