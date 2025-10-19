db.reviews.find()

db.books.findOne(
  { product_id: 34538756 },
  { _id: 0, product_id: 1, product_type: 1, title: 1 }
);

var review_1 = db.reviews.findOne({ _id: 1 });
var product_1 = db.books.findOne({ product_id: 34538756 });


db.reviews.updateOne({ _id: 1 }, [
  {
    $set: {
      "product.product_id": review_1.product_id,
      "product.product_type": product_1.product_type,
      "product.title": product_1.title,
      "review.user_id": review_1.user_id,
      "review.reviewTitle": review_1.reviewTitle,
      "review.reviewBody": review_1.reviewBody,
      "review.date": review_1.date,
      "review.stars": review_1.stars,
    },
  },
  {
    $unset: [
      "product_id",
      "user_id",
      "reviewTitle",
      "reviewBody",
      "date",
      "stars",
    ],
  },
]);

db.reviews.findOne(
  { product_id: 54538756 },
  { _id: 0, product_id: 1, product_type: 1, title: 1 }
);

var review_2 = db.reviews.findOne({ _id: 2 })
var product_2 = db.books.findOne({ product_id: 54538756 })


db.reviews.updateOne({ _id: 2 }, [
  {
    $set: {
      "product.product_id": review_2.product_id,
      "product.product_type": product_2.product_type,
      "product.title": product_2.title,
      "review.user_id": review_2.user_id,
      "review.reviewTitle": review_2.reviewTitle,
      "review.reviewBody": review_2.reviewBody,
      "review.date": review_2.date,
      "review.stars": review_2.stars,
    },
  },
  {
    $unset: [
      "product_id",
      "user_id",
      "reviewTitle",
      "reviewBody",
      "date",
      "stars",
    ],
  },
]);