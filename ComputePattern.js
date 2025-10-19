db.books.find({
  product_type: {
    $in: [
      "book",
      "ebook",
      "audiobook"
    ]
  }
})

// firstPipelineStage.js
use("bookstore")
const rollUpProductTypeAndNumAuthors = [
  {
    $group: {
      _id: "$product_type",
      count: { $sum: 1 },
      averageNumberOfAuthors: { $avg: { $size: "$authors" } },
    },
  },
];

print(db.books.aggregate(rollUpProductTypeAndNumAuthors));

load("/lab/firstPipeline.js")


db.reviews.find({
  _id: { $in: [ 1, 2 ] }
})



// secondPipelineStage.js
use("bookstore");
const rollUpReviewRatingsAndUserIdsPipeline = [
  {
    $bucket: {
      groupBy: "$review.stars", // <--- fill in with the review rating field
      boundaries: [0, 1, 2, 3, 4, 5, 6],
      default: "other",
      output: {
        count: { $sum: 1 },
        user_id: { $push: "$review.user_id" },
      },
    },
  },
];
print(db.reviews.aggregate(rollUpReviewRatingsAndUserIdsPipeline));

load("/lab/secondPipeline.js")