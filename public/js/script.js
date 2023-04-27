$("#contact-form").validate({
  rules: {
    username: {
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

$("#card-form").validate({
  rules: {
    bname: {
      required: true,
      minlength: 2,
      maxlength: 70
    },
    desc: {
      required: true
    },
    address: {
      required: true
    },
    phone: {
      required: true,
      digits: true,
      minlength: 9,
      maxlength: 10
    },
    imgurl: {
      url: true
    }
  }
});